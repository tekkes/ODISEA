use serde::{Deserialize, Serialize};
use serde_json::json;
use base64::prelude::*;
use crate::portable::config::WordPressAccount;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublishResult {
    pub platform: String,
    pub post_id: String,
    pub url: String,
    pub status: String,
    pub published_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WordPressPublishParams {
    pub post_id: Option<String>, // If provided, updates existing post
    pub title: String,
    pub content_html: String,
    pub status: String, // "draft", "publish", "future"
    pub scheduled_date: Option<String>, // ISO-8601 YYYY-MM-DDTHH:MM:SS
    pub categories: Vec<u32>,
    pub tags: Vec<u32>,
    pub featured_media_id: Option<u32>,
}

pub struct WordPressPublisher;

impl WordPressPublisher {
    pub fn publish_or_update(
        account: &WordPressAccount,
        params: &WordPressPublishParams,
    ) -> Result<PublishResult, String> {
        let base_url = account.endpoint.trim_end_matches('/');
        let url = if let Some(ref pid) = params.post_id {
            format!("{}/wp-json/wp/v2/posts/{}", base_url, pid)
        } else {
            format!("{}/wp-json/wp/v2/posts", base_url)
        };

        let auth_raw = format!("{}:{}", account.username, account.app_password);
        let auth_b64 = BASE64_STANDARD.encode(auth_raw.as_bytes());
        let auth_header = format!("Basic {}", auth_b64);

        let mut body = json!({
            "title": params.title,
            "content": params.content_html,
            "status": params.status,
        });

        if let Some(ref date_str) = params.scheduled_date {
            body["date"] = json!(date_str);
        }

        if !params.categories.is_empty() {
            body["categories"] = json!(params.categories);
        }

        if !params.tags.is_empty() {
            body["tags"] = json!(params.tags);
        }

        if let Some(media_id) = params.featured_media_id {
            body["featured_media"] = json!(media_id);
        }

        let resp_result = ureq::post(&url)
            .header("Authorization", &auth_header)
            .header("Content-Type", "application/json")
            .send_json(&body);

        let mut resp = resp_result.map_err(|e| {
            format!("Error al conectar con la API de WordPress ({}): {}", url, e)
        })?;

        let parsed: serde_json::Value = resp
            .body_mut()
            .read_json()
            .map_err(|e| format!("Error al decodificar respuesta JSON de WordPress: {}", e))?;

        if let Some(err_msg) = parsed["message"].as_str() {
            if parsed["code"].is_string() {
                return Err(format!("Error de WordPress [{}]: {}", parsed["code"].as_str().unwrap_or(""), err_msg));
            }
        }

        let post_id = parsed["id"]
            .as_u64()
            .map(|id| id.to_string())
            .unwrap_or_else(|| params.post_id.clone().unwrap_or_default());

        let post_url = parsed["link"]
            .as_str()
            .unwrap_or("")
            .to_string();

        let post_status = parsed["status"]
            .as_str()
            .unwrap_or(&params.status)
            .to_string();

        let published_at = parsed["date"]
            .as_str()
            .unwrap_or("")
            .to_string();

        Ok(PublishResult {
            platform: "wordpress".to_string(),
            post_id,
            url: post_url,
            status: post_status,
            published_at,
        })
    }
}
