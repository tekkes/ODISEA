#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    Variable(String),
    Mixin(String),
    Identifier(String),
    Number(f64),
    Unit(String),
    StringLiteral(String),
    Color(String),
    Equals,
    Colon,
    Semicolon,
    Comma,
    Plus,
    Minus,
    Star,
    Slash,
    OpenBrace,
    CloseBrace,
    OpenParen,
    CloseParen,
    OpenBracket,
    CloseBracket,
    Newline,
    Eof,
}

pub struct UlssLexer<'a> {
    _input: &'a str,
    chars: std::iter::Peekable<std::str::CharIndices<'a>>,
}

impl<'a> UlssLexer<'a> {
    pub fn new(input: &'a str) -> Self {
        Self {
            _input: input,
            chars: input.char_indices().peekable(),
        }
    }

    pub fn tokenize_all(&mut self) -> Result<Vec<Token>, String> {
        let mut tokens = Vec::new();
        loop {
            let tok = self.next_token()?;
            if tok == Token::Eof {
                tokens.push(tok);
                break;
            }
            tokens.push(tok);
        }
        Ok(tokens)
    }

    pub fn next_token(&mut self) -> Result<Token, String> {
        while let Some(&(_, ch)) = self.chars.peek() {
            if ch == ' ' || ch == '\t' || ch == '\r' {
                self.chars.next();
                continue;
            }

            // Skip comments // or /* ... */
            if ch == '/' {
                let mut clone = self.chars.clone();
                clone.next();
                if let Some(&(_, '/')) = clone.peek() {
                    // Line comment
                    self.chars.next();
                    self.chars.next();
                    while let Some(&(_, next_ch)) = self.chars.peek() {
                        if next_ch == '\n' {
                            break;
                        }
                        self.chars.next();
                    }
                    continue;
                } else if let Some(&(_, '*')) = clone.peek() {
                    // Block comment
                    self.chars.next();
                    self.chars.next();
                    let mut prev = ' ';
                    while let Some(&(_, next_ch)) = self.chars.peek() {
                        self.chars.next();
                        if prev == '*' && next_ch == '/' {
                            break;
                        }
                        prev = next_ch;
                    }
                    continue;
                }
            }

            break;
        }

        let (_, ch) = match self.chars.next() {
            Some(pair) => pair,
            None => return Ok(Token::Eof),
        };

        match ch {
            '\n' => Ok(Token::Newline),
            '=' => Ok(Token::Equals),
            ':' => Ok(Token::Colon),
            ';' => Ok(Token::Semicolon),
            ',' => Ok(Token::Comma),
            '+' => Ok(Token::Plus),
            '-' => Ok(Token::Minus),
            '*' => Ok(Token::Star),
            '/' => Ok(Token::Slash),
            '{' => Ok(Token::OpenBrace),
            '}' => Ok(Token::CloseBrace),
            '(' => Ok(Token::OpenParen),
            ')' => Ok(Token::CloseParen),
            '[' => Ok(Token::OpenBracket),
            ']' => Ok(Token::CloseBracket),
            '$' => {
                let name = self.read_identifier_chars();
                Ok(Token::Variable(name))
            }
            '@' => {
                let name = self.read_identifier_chars();
                Ok(Token::Mixin(name))
            }
            '#' => {
                let color_hex = self.read_hex_color();
                Ok(Token::Color(format!("#{}", color_hex)))
            }
            '"' | '\'' => {
                let quote = ch;
                let mut text = String::new();
                for (_, next_ch) in self.chars.by_ref() {
                    if next_ch == quote {
                        break;
                    }
                    text.push(next_ch);
                }
                Ok(Token::StringLiteral(text))
            }
            '0'..='9' => {
                let mut num_str = String::new();
                num_str.push(ch);
                while let Some(&(_, next_ch)) = self.chars.peek() {
                    if next_ch.is_ascii_digit() || next_ch == '.' {
                        num_str.push(next_ch);
                        self.chars.next();
                    } else {
                        break;
                    }
                }
                let num: f64 = num_str.parse().map_err(|e| format!("Invalid number: {}", e))?;

                // Check for unit (pt, mm, cm, in, em, en, ex, %)
                let mut unit_str = String::new();
                while let Some(&(_, next_ch)) = self.chars.peek() {
                    if next_ch.is_alphabetic() || next_ch == '%' {
                        unit_str.push(next_ch);
                        self.chars.next();
                    } else {
                        break;
                    }
                }

                if !unit_str.is_empty() {
                    Ok(Token::Unit(format!("{}{}", num, unit_str)))
                } else {
                    Ok(Token::Number(num))
                }
            }
            _ if ch.is_alphabetic() || ch == '_' => {
                let mut ident = String::new();
                ident.push(ch);
                while let Some(&(_, next_ch)) = self.chars.peek() {
                    if next_ch.is_alphanumeric() || next_ch == '-' || next_ch == '_' {
                        ident.push(next_ch);
                        self.chars.next();
                    } else {
                        break;
                    }
                }
                Ok(Token::Identifier(ident))
            }
            other => Err(format!("Unexpected character in ULSS: '{}'", other)),
        }
    }

    fn read_identifier_chars(&mut self) -> String {
        let mut text = String::new();
        while let Some(&(_, ch)) = self.chars.peek() {
            if ch.is_alphanumeric() || ch == '-' || ch == '_' {
                text.push(ch);
                self.chars.next();
            } else {
                break;
            }
        }
        text
    }

    fn read_hex_color(&mut self) -> String {
        let mut hex = String::new();
        while let Some(&(_, ch)) = self.chars.peek() {
            if ch.is_ascii_hexdigit() {
                hex.push(ch);
                self.chars.next();
            } else {
                break;
            }
        }
        hex
    }
}
