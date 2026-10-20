use serde::{Deserialize, Serialize};
use serde_json::json;
use crate::portable::config::OdiseaConfig;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LlmAssistRequest {
    pub action: String, // "rewrite", "summarize", "tone_literary", "tone_concise", "passive_to_active", "custom"
    pub text: String,
    pub custom_prompt: Option<String>,
}

pub struct LlmConnector;

impl LlmConnector {
    pub fn execute_assist(
        config: &OdiseaConfig,
        req: &LlmAssistRequest,
    ) -> Result<String, String> {
        if req.text.trim().is_empty() {
            return Err("El texto proporcionado está vacío.".to_string());
        }

        let system_instruction = match req.action.as_str() {
            "rewrite" => "Eres un editor literario experto. Reescribe el siguiente texto para maximizar su claridad, ritmo y riqueza léxica, preservando fielmente su significado y dialecto en español.",
            "summarize" => "Eres un analista y sintetizador de textos. Genera un resumen conciso y estructurado del siguiente texto en 2 o 3 párrafos.",
            "tone_literary" => "Reescribe el siguiente texto con un tono literario evocador, elegante y poético, cuidando la cadencia de las frases.",
            "tone_concise" => "Reescribe el siguiente texto eliminando toda palabra innecesaria o muletilla, logrando la máxima concisión sin perder información esencial.",
            "passive_to_active" => "Convierte todas las construcciones en voz pasiva del siguiente texto a voz activa directa, natural y dinámica.",
            "custom" => req.custom_prompt.as_deref().unwrap_or("Mejora el siguiente texto:"),
            _ => "Mejora el siguiente texto:",
        };

        let full_prompt = format!("{}\n\nTexto original:\n\"\"\"\n{}\n\"\"\"\n\nTexto mejorado:", system_instruction, req.text);

        // Check provider in config: "ollama" or "openai_compatible"
        if config.llm.provider.to_lowercase() == "openai_compatible" {
            Self::call_openai_compatible(&config.llm.endpoint, &config.llm.model, config.llm.api_key.as_deref(), &full_prompt)
        } else {
            // Default to Ollama
            Self::call_ollama(&config.llm.endpoint, &config.llm.model, &full_prompt)
        }
    }

    fn call_ollama(endpoint: &str, model: &str, prompt: &str) -> Result<String, String> {
        let base = endpoint.trim_end_matches('/');
        let url = format!("{}/api/generate", base);

        let body = json!({
            "model": model,
            "prompt": prompt,
            "stream": false,
            "options": {
                "temperature": 0.7
            }
        });

        let resp = ureq::post(&url)
            .header("Content-Type", "application/json")
            .send_json(&body)
            .map_err(|e| {
                format!(
                    "No se pudo conectar con Ollama en {}. Asegúrate de que Ollama está en ejecución ('ollama serve') y el modelo '{}' está descargado ('ollama pull {}'). Error: {}",
                    base, model, model, e
                )
            })?;

        let mut resp = resp;
        let parsed: serde_json::Value = resp
            .body_mut()
            .read_json()
            .map_err(|e| format!("Error al decodificar respuesta JSON de Ollama: {}", e))?;

        if let Some(text) = parsed["response"].as_str() {
            Ok(text.trim().to_string())
        } else {
            Err("Respuesta de Ollama vacía o con formato inesperado.".to_string())
        }
    }

    fn call_openai_compatible(
        endpoint: &str,
        model: &str,
        api_key: Option<&str>,
        prompt: &str,
    ) -> Result<String, String> {
        let base = endpoint.trim_end_matches('/');
        let url = format!("{}/v1/chat/completions", base);

        let mut req = ureq::post(&url).header("Content-Type", "application/json");

        if let Some(key) = api_key {
            if !key.is_empty() {
                req = req.header("Authorization", &format!("Bearer {}", key));
            }
        }

        let body = json!({
            "model": model,
            "messages": [
                {"role": "system", "content": "Eres un asistente de escritura y revisión literaria."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        });

        let mut resp = req.send_json(&body).map_err(|e| {
            format!("Error de conexión con la API de IA ({}) : {}", url, e)
        })?;

        let parsed: serde_json::Value = resp
            .body_mut()
            .read_json()
            .map_err(|e| format!("Error al decodificar respuesta JSON de la API: {}", e))?;


        if let Some(content) = parsed["choices"][0]["message"]["content"].as_str() {
            Ok(content.trim().to_string())
        } else {
            Err("No se encontró contenido en la respuesta de la API de IA.".to_string())
        }
    }
}
