use serde::{Deserialize, Serialize};
use serde_json::json;
use crate::portable::config::MicroBlogAccount;
use crate::publishers::wordpress::PublishResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MicroBlogPublishParams {
    pub post_url: Option<String>, // If provided, updates existing post via Micropub update action
    pub title: Option<String>,
    pub content_html: String,
    pub categories: Vec<String>,
    pub slug: Option<String>,
}

pub struct MicroBlogPublisher;

impl MicroBlogPublisher {
    pub fn publish_or_update(
        account: &MicroBlogAccount,
        params: &MicroBlogPublishParams,
    ) -> Result<PublishResult, String> {
        if account.app_token.trim().is_empty() {
            return Err("App Token de Micro.blog no configurado".to_string());
        }

        let endpoint = "https://micro.blog/micropub";

        if let Some(ref existing_url) = params.post_url {
            // Update action in Micropub standard
            let mut replace_obj = json!({
                "content": [params.content_html]
            });
            if let Some(ref t) = params.title {
                replace_obj["name"] = json!([t]);
            }

            let body = json!({
                "action": "update",
                "url": existing_url,
                "replace": replace_obj
            });

            let _resp = ureq::post(endpoint)
                .header("Authorization", &format!("Bearer {}", account.app_token))
                .header("Content-Type", "application/json")
                .send_json(&body)
                .map_err(|e| format!("Error al actualizar entrada en Micro.blog: {}", e))?;

            let published_at = chrono::Utc::now().to_rfc3339();

            Ok(PublishResult {
                platform: "microblog".to_string(),
                post_id: existing_url.clone(),
                url: existing_url.clone(),
                status: "published".to_string(),
                published_at,
            })
        } else {
            // Create new entry
            let mut properties = json!({
                "content": [params.content_html]
            });

            if let Some(ref t) = params.title {
                properties["name"] = json!([t]);
            }

            if !params.categories.is_empty() {
                properties["category"] = json!(params.categories);
            }

            if let Some(ref s) = params.slug {
                properties["mp-slug"] = json!([s]);
            }

            let body = json!({
                "type": ["h-entry"],
                "properties": properties
            });

            let resp = ureq::post(endpoint)
                .header("Authorization", &format!("Bearer {}", account.app_token))
                .header("Content-Type", "application/json")
                .send_json(&body)
                .map_err(|e| format!("Error al publicar en Micro.blog: {}", e))?;

            let location_header = resp
                .headers()
                .get("Location")
                .and_then(|v| v.to_str().ok())
                .unwrap_or("")
                .to_string();

            let post_url = if location_header.is_empty() {
                "https://micro.blog/".to_string()
            } else {
                location_header
            };

            let published_at = chrono::Utc::now().to_rfc3339();

            Ok(PublishResult {
                platform: "microblog".to_string(),
                post_id: post_url.clone(),
                url: post_url,
                status: "published".to_string(),
                published_at,
            })
        }
    }
}
