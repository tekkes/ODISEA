use serde::{Deserialize, Serialize};
use serde_json::json;
use crate::portable::config::MediumAccount;
use crate::publishers::wordpress::PublishResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediumPublishParams {
    pub title: String,
    pub content_html: String,
    pub publish_status: String, // "public", "draft", "unlisted"
    pub tags: Vec<String>,
    pub canonical_url: Option<String>,
}

pub struct MediumPublisher;

impl MediumPublisher {
    pub fn publish(
        account: &MediumAccount,
        params: &MediumPublishParams,
    ) -> Result<PublishResult, String> {
        if account.token.trim().is_empty() {
            return Err("Token de integración de Medium no configurado".to_string());
        }

        // 1. Get user profile and ID
        let me_url = "https://api.medium.com/v1/me";
        let mut me_resp = ureq::get(me_url)
            .header("Authorization", &format!("Bearer {}", account.token))
            .header("Accept", "application/json")
            .call()
            .map_err(|e| format!("Error al obtener perfil de usuario en Medium: {}", e))?;

        let me_json: serde_json::Value = me_resp
            .body_mut()
            .read_json()
            .map_err(|e| format!("Error al decodificar respuesta de Medium /me: {}", e))?;

        let user_id = me_json["data"]["id"]
            .as_str()
            .ok_or_else(|| "No se pudo recuperar el ID de usuario de Medium".to_string())?;

        // 2. Publish post
        let post_url = format!("https://api.medium.com/v1/users/{}/posts", user_id);

        let mut body = json!({
            "title": params.title,
            "contentFormat": "html",
            "content": params.content_html,
            "publishStatus": params.publish_status,
        });

        if !params.tags.is_empty() {
            body["tags"] = json!(params.tags);
        }

        if let Some(ref can) = params.canonical_url {
            body["canonicalUrl"] = json!(can);
        }

        let mut post_resp = ureq::post(&post_url)
            .header("Authorization", &format!("Bearer {}", account.token))
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .send_json(&body)
            .map_err(|e| format!("Error al publicar en Medium: {}", e))?;

        let parsed: serde_json::Value = post_resp
            .body_mut()
            .read_json()
            .map_err(|e| format!("Error al decodificar respuesta de publicación en Medium: {}", e))?;

        let post_data = &parsed["data"];
        let post_id = post_data["id"].as_str().unwrap_or("").to_string();
        let remote_url = post_data["url"].as_str().unwrap_or("").to_string();
        let status = post_data["publishStatus"].as_str().unwrap_or(&params.publish_status).to_string();
        let published_at = chrono::Utc::now().to_rfc3339();

        Ok(PublishResult {
            platform: "medium".to_string(),
            post_id,
            url: remote_url,
            status,
            published_at,
        })
    }
}
