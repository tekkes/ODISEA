use serde::{Deserialize, Serialize};
use serde_json::json;
use ring::hmac;
use base64::prelude::*;
use crate::portable::config::GhostAccount;
use crate::publishers::wordpress::PublishResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GhostPublishParams {
    pub post_id: Option<String>,
    pub title: String,
    pub content_html: String,
    pub status: String, // "draft", "published", "scheduled"
    pub scheduled_date: Option<String>,
    pub tags: Vec<String>,
    pub feature_image_url: Option<String>,
    pub updated_at: Option<String>, // Required for Ghost updates to prevent race conditions
}

pub struct GhostPublisher;

impl GhostPublisher {
    pub fn generate_ghost_jwt(admin_api_key: &str) -> Result<String, String> {
        let parts: Vec<&str> = admin_api_key.split(':').collect();
        if parts.len() != 2 {
            return Err("Ghost Admin API Key debe tener el formato id:secret".to_string());
        }
        let key_id = parts[0];
        let secret_hex = parts[1];
        let secret_bytes = Self::hex_to_bytes(secret_hex)?;

        let now = chrono::Utc::now().timestamp();
        let header = json!({
            "alg": "HS256",
            "typ": "JWT",
            "kid": key_id
        });
        let payload = json!({
            "iat": now,
            "exp": now + 300,
            "aud": "/admin/"
        });

        let header_b64 = BASE64_URL_SAFE_NO_PAD.encode(header.to_string().as_bytes());
        let payload_b64 = BASE64_URL_SAFE_NO_PAD.encode(payload.to_string().as_bytes());
        let unsigned = format!("{}.{}", header_b64, payload_b64);

        let key = hmac::Key::new(hmac::HMAC_SHA256, &secret_bytes);
        let signature = hmac::sign(&key, unsigned.as_bytes());
        let sig_b64 = BASE64_URL_SAFE_NO_PAD.encode(signature.as_ref());

        Ok(format!("{}.{}", unsigned, sig_b64))
    }

    fn hex_to_bytes(hex: &str) -> Result<Vec<u8>, String> {
        if hex.len() % 2 != 0 {
            return Err("Longitud hexadecimal impar en la clave de Ghost".to_string());
        }
        (0..hex.len())
            .step_by(2)
            .map(|i| u8::from_str_radix(&hex[i..i + 2], 16).map_err(|e| e.to_string()))
            .collect()
    }

    pub fn publish_or_update(
        account: &GhostAccount,
        params: &GhostPublishParams,
    ) -> Result<PublishResult, String> {
        let token = Self::generate_ghost_jwt(&account.admin_api_key)?;
        let base_url = account.endpoint.trim_end_matches('/');

        let is_update = params.post_id.is_some();
        let url = if let Some(ref pid) = params.post_id {
            format!("{}/ghost/api/admin/posts/{}/?source=html", base_url, pid)
        } else {
            format!("{}/ghost/api/admin/posts/?source=html", base_url)
        };

        let mut post_obj = json!({
            "title": params.title,
            "html": params.content_html,
            "status": params.status,
        });

        if let Some(ref date_str) = params.scheduled_date {
            post_obj["published_at"] = json!(date_str);
        }

        if !params.tags.is_empty() {
            let tags_json: Vec<_> = params.tags.iter().map(|t| json!({"name": t})).collect();
            post_obj["tags"] = json!(tags_json);
        }

        if let Some(ref img_url) = params.feature_image_url {
            post_obj["feature_image"] = json!(img_url);
        }

        if let Some(ref upd) = params.updated_at {
            post_obj["updated_at"] = json!(upd);
        }

        let body = json!({ "posts": [post_obj] });

        let resp_result = if is_update {
            ureq::put(&url)
                .header("Authorization", &format!("Ghost {}", token))
                .header("Content-Type", "application/json")
                .send_json(&body)
        } else {
            ureq::post(&url)
                .header("Authorization", &format!("Ghost {}", token))
                .header("Content-Type", "application/json")
                .send_json(&body)
        };

        let mut resp = resp_result.map_err(|e| {
            format!("Error al conectar con la API de Ghost ({}): {}", url, e)
        })?;

        let parsed: serde_json::Value = resp
            .body_mut()
            .read_json()
            .map_err(|e| format!("Error al decodificar respuesta JSON de Ghost: {}", e))?;

        if let Some(errors) = parsed["errors"].as_array() {
            if let Some(first) = errors.first() {
                let msg = first["message"].as_str().unwrap_or("Error desconocido de Ghost");
                return Err(format!("Ghost Admin API: {}", msg));
            }
        }

        let first_post = parsed["posts"]
            .as_array()
            .and_then(|arr| arr.first())
            .ok_or_else(|| "Respuesta de Ghost sin post creado".to_string())?;

        let post_id = first_post["id"].as_str().unwrap_or("").to_string();
        let post_url = first_post["url"].as_str().unwrap_or("").to_string();
        let post_status = first_post["status"].as_str().unwrap_or(&params.status).to_string();
        let published_at = first_post["published_at"].as_str().unwrap_or("").to_string();

        Ok(PublishResult {
            platform: "ghost".to_string(),
            post_id,
            url: post_url,
            status: post_status,
            published_at,
        })
    }
}
