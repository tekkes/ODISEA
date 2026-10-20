use crate::ulss_engine::ast::*;
use crate::ulss_engine::lexer::{Token, UlssLexer};
use std::collections::HashMap;

pub struct UlssParser {
    tokens: Vec<Token>,
    cursor: usize,
}

impl UlssParser {
    pub fn new(tokens: Vec<Token>) -> Self {
        Self { tokens, cursor: 0 }
    }

    pub fn parse_stylesheet(input: &str) -> Result<UlssStylesheet, String> {
        let mut lexer = UlssLexer::new(input);
        let tokens = lexer.tokenize_all()?;
        let mut parser = UlssParser::new(tokens);
        parser.parse()
    }

    pub fn parse(&mut self) -> Result<UlssStylesheet, String> {
        let mut stylesheet = UlssStylesheet::new();

        while !self.is_at_end() {
            self.skip_newlines();
            if self.is_at_end() {
                break;
            }

            match self.peek() {
                Token::Variable(_) => {
                    let (name, expr) = self.parse_variable_definition()?;
                    stylesheet.variables.insert(name, expr);
                }
                Token::Mixin(_) => {
                    let (name, decls) = self.parse_mixin_definition()?;
                    stylesheet.mixins.insert(name, decls);
                }
                Token::Identifier(_) => {
                    let rule = self.parse_style_rule()?;
                    stylesheet.rules.push(rule);
                }
                _ => {
                    self.advance();
                }
            }
        }

        Ok(stylesheet)
    }

    fn parse_variable_definition(&mut self) -> Result<(String, Expression), String> {
        let var_tok = self.advance();
        let name = match var_tok {
            Token::Variable(n) => n,
            _ => return Err("Expected variable token".to_string()),
        };

        if self.peek() == Token::Equals || self.peek() == Token::Colon {
            self.advance();
        } else {
            return Err("Expected '=' or ':' in variable assignment".to_string());
        }

        let expr = self.parse_expression()?;
        self.consume_statement_end();
        Ok((name, expr))
    }

    fn parse_mixin_definition(&mut self) -> Result<(String, HashMap<String, Expression>), String> {
        let mixin_tok = self.advance();
        let mut name = match mixin_tok {
            Token::Mixin(n) => n,
            _ => return Err("Expected mixin token".to_string()),
        };

        // If author wrote `@mixin name { ... }` instead of `@name { ... }`
        if name.to_lowercase() == "mixin" {
            self.skip_newlines();
            if let Token::Identifier(id) = self.peek() {
                self.advance();
                name = id;
            }
        }

        let decls = self.parse_declaration_block()?;
        Ok((name, decls))
    }

    fn parse_style_rule(&mut self) -> Result<StyleRule, String> {
        let mut selectors = Vec::new();
        let mut mixins = Vec::new();

        let mut current_sel = String::new();

        while !self.is_at_end() && self.peek() != Token::OpenBrace {
            match self.peek() {
                Token::Comma => {
                    self.advance();
                    if !current_sel.is_empty() {
                        selectors.push(current_sel.trim().to_string());
                        current_sel.clear();
                    }
                }
                Token::Plus => {
                    self.advance();
                    current_sel.push_str(" + ");
                }
                Token::Colon => {
                    self.advance();
                    // Could be a mixin (: @mixin) or pseudo-class (:first-page, :header, :anchor)
                    if let Token::Mixin(m) = self.peek() {
                        self.advance();
                        mixins.push(m);
                    } else if let Token::Identifier(pseudo) = self.peek() {
                        self.advance();
                        if !current_sel.is_empty() {
                            current_sel.push(':');
                            current_sel.push_str(&pseudo);
                        } else {
                            current_sel.push(':');
                            current_sel.push_str(&pseudo);
                        }
                    }
                }
                Token::Mixin(m) => {
                    self.advance();
                    mixins.push(m);
                }
                Token::Identifier(s) => {
                    self.advance();
                    if !current_sel.is_empty() && !current_sel.ends_with(" + ") && !current_sel.ends_with(':') {
                        current_sel.push(' ');
                    }
                    current_sel.push_str(&s);
                }
                Token::Newline => {
                    self.advance();
                }
                _ => {
                    self.advance();
                }
            }
        }

        if !current_sel.is_empty() {
            selectors.push(current_sel.trim().to_string());
        }

        let declarations = self.parse_declaration_block()?;

        Ok(StyleRule {
            selectors,
            mixins,
            declarations,
        })
    }

    fn parse_declaration_block(&mut self) -> Result<HashMap<String, Expression>, String> {
        self.skip_newlines();
        if self.peek() != Token::OpenBrace {
            return Err("Expected '{' to start declaration block".to_string());
        }
        self.advance();

        let mut declarations = HashMap::new();
        while !self.is_at_end() && self.peek() != Token::CloseBrace {
            self.skip_newlines();
            if self.peek() == Token::CloseBrace {
                break;
            }

            if let Token::Identifier(prop_name) = self.advance() {
                if self.peek() == Token::Colon {
                    self.advance();
                }
                let expr = self.parse_expression()?;
                declarations.insert(prop_name, expr);
                self.consume_statement_end();
            } else {
                self.advance();
            }
        }

        if self.peek() == Token::CloseBrace {
            self.advance();
        }

        Ok(declarations)
    }

    fn parse_expression(&mut self) -> Result<Expression, String> {
        let left = self.parse_primary()?;

        if self.peek() == Token::Plus || self.peek() == Token::Minus || self.peek() == Token::Star || self.peek() == Token::Slash {
            let op_char = match self.advance() {
                Token::Plus => '+',
                Token::Minus => '-',
                Token::Star => '*',
                Token::Slash => '/',
                _ => unreachable!(),
            };
            let right = self.parse_expression()?;
            return Ok(Expression::BinaryOp {
                op: op_char,
                left: Box::new(left),
                right: Box::new(right),
            });
        }

        Ok(left)
    }

    fn parse_primary(&mut self) -> Result<Expression, String> {
        match self.advance() {
            Token::Variable(v) => Ok(Expression::Variable(v)),
            Token::Number(n) => Ok(Expression::Literal(Value::Number(n))),
            Token::Unit(u) => {
                let (val, unit) = self.parse_unit_string(&u);
                Ok(Expression::Literal(Value::Length(val, unit)))
            }
            Token::StringLiteral(s) => Ok(Expression::Literal(Value::String(s))),
            Token::Color(c) => Ok(Expression::Literal(Value::Color(c))),
            Token::Identifier(id) => {
                if id.eq_ignore_ascii_case("yes") || id.eq_ignore_ascii_case("true") {
                    Ok(Expression::Literal(Value::Boolean(true)))
                } else if id.eq_ignore_ascii_case("no") || id.eq_ignore_ascii_case("false") {
                    Ok(Expression::Literal(Value::Boolean(false)))
                } else {
                    Ok(Expression::Literal(Value::Symbol(id)))
                }
            }
            other => Err(format!("Unexpected expression token: {:?}", other)),
        }
    }

    fn parse_unit_string(&self, s: &str) -> (f64, Unit) {
        let mut num_str = String::new();
        let mut unit_str = String::new();
        for ch in s.chars() {
            if ch.is_ascii_digit() || ch == '.' || ch == '-' {
                num_str.push(ch);
            } else {
                unit_str.push(ch);
            }
        }
        let val = num_str.parse().unwrap_or(0.0);
        let unit = match unit_str.to_lowercase().as_str() {
            "mm" => Unit::Mm,
            "cm" => Unit::Cm,
            "in" => Unit::In,
            "em" => Unit::Em,
            "en" => Unit::En,
            "ex" => Unit::Ex,
            "%" => Unit::Percent,
            _ => Unit::Pt,
        };
        (val, unit)
    }

    fn skip_newlines(&mut self) {
        while self.peek() == Token::Newline {
            self.advance();
        }
    }

    fn consume_statement_end(&mut self) {
        if self.peek() == Token::Semicolon || self.peek() == Token::Newline {
            self.advance();
        }
    }

    fn peek(&self) -> Token {
        if self.cursor < self.tokens.len() {
            self.tokens[self.cursor].clone()
        } else {
            Token::Eof
        }
    }

    fn advance(&mut self) -> Token {
        if self.cursor < self.tokens.len() {
            let tok = self.tokens[self.cursor].clone();
            self.cursor += 1;
            tok
        } else {
            Token::Eof
        }
    }

    fn is_at_end(&self) -> bool {
        self.cursor >= self.tokens.len() || self.tokens[self.cursor] == Token::Eof
    }
}
