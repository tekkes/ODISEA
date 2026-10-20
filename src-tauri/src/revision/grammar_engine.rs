use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrammarError {
    pub offset: usize,
    pub length: usize,
    pub message: String,
    pub short_message: String,
    pub replacements: Vec<String>,
}

pub struct GrammarEngine {
    pub language: String,
}

impl GrammarEngine {
    pub fn new(language: &str) -> Self {
        Self {
            language: language.to_string(),
        }
    }

    pub fn check_text(&self, _text: &str) -> Vec<GrammarError> {
        // Return empty issues for clean initial scaffolding
        Vec::new()
    }
}
