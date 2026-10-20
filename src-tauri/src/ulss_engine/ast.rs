use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Unit {
    Pt,
    Mm,
    Cm,
    In,
    Em,
    En,
    Ex,
    Percent,
}

impl Unit {
    pub fn to_css_str(&self) -> &'static str {
        match self {
            Unit::Pt => "pt",
            Unit::Mm => "mm",
            Unit::Cm => "cm",
            Unit::In => "in",
            Unit::Em => "em",
            Unit::En => "em",
            Unit::Ex => "ex",
            Unit::Percent => "%",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Value {
    Number(f64),
    Length(f64, Unit),
    String(String),
    Color(String),
    Symbol(String),
    Boolean(bool),
    Array(Vec<Value>),
}

impl Value {
    pub fn as_str(&self) -> &str {
        match self {
            Value::String(s) => s.as_str(),
            Value::Symbol(s) => s.as_str(),
            Value::Color(s) => s.as_str(),
            _ => "",
        }
    }

    pub fn as_bool(&self) -> Option<bool> {
        match self {
            Value::Boolean(b) => Some(*b),
            Value::Symbol(s) => {
                if s.eq_ignore_ascii_case("yes") || s.eq_ignore_ascii_case("true") {
                    Some(true)
                } else if s.eq_ignore_ascii_case("no") || s.eq_ignore_ascii_case("false") {
                    Some(false)
                } else {
                    None
                }
            }
            _ => None,
        }
    }

    pub fn to_pt(&self) -> f64 {
        match self {
            Value::Number(n) => *n,
            Value::Length(v, Unit::Pt) => *v,
            Value::Length(v, Unit::Mm) => *v * 2.83465,
            Value::Length(v, Unit::Cm) => *v * 28.3465,
            Value::Length(v, Unit::In) => *v * 72.0,
            Value::Length(v, Unit::Em) => *v * 12.0,
            Value::Length(v, Unit::En) => *v * 6.0,
            Value::Length(v, Unit::Ex) => *v * 6.0,
            Value::Length(v, Unit::Percent) => *v,
            _ => 0.0,
        }
    }

    pub fn to_css_string(&self) -> String {
        match self {
            Value::Number(n) => {
                if (n.fract()).abs() < 1e-6 {
                    format!("{:.0}", n)
                } else {
                    format!("{:.2}", n)
                }
            }
            Value::Length(v, unit) => {
                let unit_str = unit.to_css_str();
                if (v.fract()).abs() < 1e-6 {
                    format!("{:.0}{}", v, unit_str)
                } else {
                    format!("{:.2}{}", v, unit_str)
                }
            }
            Value::String(s) => format!("\"{}\"", s),
            Value::Color(c) => c.clone(),
            Value::Symbol(s) => s.clone(),
            Value::Boolean(b) => if *b { "true".to_string() } else { "false".to_string() },
            Value::Array(items) => {
                let parts: Vec<String> = items.iter().map(|it| it.to_css_string()).collect();
                parts.join(" ")
            }
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Expression {
    Literal(Value),
    Variable(String),
    BinaryOp {
        op: char,
        left: Box<Expression>,
        right: Box<Expression>,
    },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PropertySetting {
    pub name: String,
    pub expr: Expression,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StyleRule {
    pub selectors: Vec<String>,
    pub mixins: Vec<String>,
    pub declarations: HashMap<String, Expression>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct UlssStylesheet {
    pub variables: HashMap<String, Expression>,
    pub mixins: HashMap<String, HashMap<String, Expression>>,
    pub rules: Vec<StyleRule>,
}

impl UlssStylesheet {
    pub fn new() -> Self {
        Self {
            variables: HashMap::new(),
            mixins: HashMap::new(),
            rules: Vec::new(),
        }
    }
}

impl Default for UlssStylesheet {
    fn default() -> Self {
        Self::new()
    }
}
