use serde::{Deserialize, Serialize};
use std::fs;
use crate::portable::paths::get_config_path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternalFolderConfig {
    pub id: String,
    pub name: String,
    pub path: String,
    pub mode: String, // "markdown" or "native_ulyz"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LlmConfig {
    pub provider: String, // "ollama" or "openai_compatible"
    pub endpoint: String,
    pub model: String,
    pub api_key: Option<String>,
}

impl Default for LlmConfig {
    fn default() -> Self {
        Self {
            provider: "ollama".to_string(),
            endpoint: "http://localhost:11434".to_string(),
            model: "llama3.2".to_string(),
            api_key: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct WordPressAccount {
    pub name: String,
    pub endpoint: String,
    pub username: String,
    pub app_password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GhostAccount {
    pub name: String,
    pub endpoint: String,
    pub admin_api_key: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MediumAccount {
    pub name: String,
    pub token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MicroBlogAccount {
    pub name: String,
    pub app_token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PublishersConfig {
    #[serde(default)]
    pub wordpress: Vec<WordPressAccount>,
    #[serde(default)]
    pub ghost: Vec<GhostAccount>,
    #[serde(default)]
    pub medium: Vec<MediumAccount>,
    #[serde(default)]
    pub microblog: Vec<MicroBlogAccount>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OdiseaConfig {
    pub theme_mode: String,
    pub active_theme: String,
    pub active_style: String,
    pub typewriter_enabled: bool,
    pub typewriter_position: String,
    pub focus_mode: String,
    pub show_library: bool,
    pub show_sheet_list: bool,
    pub show_dashboard: bool,
    pub auto_backup_hours: u32,
    pub spell_check_language: String,
    #[serde(default)]
    pub external_folders: Vec<ExternalFolderConfig>,
    #[serde(default)]
    pub llm: LlmConfig,
    #[serde(default)]
    pub publishers: PublishersConfig,
}

impl Default for OdiseaConfig {
    fn default() -> Self {
        Self {
            theme_mode: "dark".to_string(),
            active_theme: "carbon_dark".to_string(),
            active_style: "default".to_string(),
            typewriter_enabled: false,
            typewriter_position: "center".to_string(),
            focus_mode: "none".to_string(),
            show_library: true,
            show_sheet_list: true,
            show_dashboard: false,
            auto_backup_hours: 1,
            spell_check_language: "es".to_string(),
            external_folders: Vec::new(),
            llm: LlmConfig::default(),
            publishers: PublishersConfig::default(),
        }
    }
}

pub fn load_config() -> OdiseaConfig {
    let path = get_config_path();
    if path.exists() {
        if let Ok(content) = fs::read_to_string(&path) {
            if let Ok(mut config) = toml::from_str::<OdiseaConfig>(&content) {
                if config.active_theme == "default" {
                    config.active_theme = if config.theme_mode == "light" {
                        "minimalist".to_string()
                    } else {
                        "carbon_dark".to_string()
                    };
                }
                return config;
            }
        }
    }
    let config = OdiseaConfig::default();
    let _ = save_config(&config);
    config
}

pub fn save_config(config: &OdiseaConfig) -> Result<(), String> {
    let path = get_config_path();
    let content = toml::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(path, content).map_err(|e| e.to_string())?;
    Ok(())
}
