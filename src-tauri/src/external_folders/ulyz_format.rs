use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::{Cursor, Read, Write};
use std::path::Path;
use zip::write::SimpleFileOptions;
use zip::{ZipArchive, ZipWriter};
use chrono::Utc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UlyzManifest {
    pub version: u32,
    pub title: String,
    pub markup_dialect: String,
    pub writing_goal_json: Option<String>,
    pub tags: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl Default for UlyzManifest {
    fn default() -> Self {
        let now = Utc::now().to_rfc3339();
        Self {
            version: 1,
            title: "Hoja Externa".to_string(),
            markup_dialect: "markdown_xl".to_string(),
            writing_goal_json: None,
            tags: Vec::new(),
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone)]
pub struct UlyzPackage {
    pub manifest: UlyzManifest,
    pub content_mdxl: String,
    pub attachments: HashMap<String, Vec<u8>>,
}

impl UlyzPackage {
    pub fn new(title: &str, content: &str) -> Self {
        let mut manifest = UlyzManifest::default();
        manifest.title = title.to_string();
        Self {
            manifest,
            content_mdxl: content.to_string(),
            attachments: HashMap::new(),
        }
    }

    pub fn pack_to_bytes(&self) -> Result<Vec<u8>, String> {
        let buffer = Vec::new();
        let mut zip = ZipWriter::new(Cursor::new(buffer));
        let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

        // 1. Write manifest.json
        let manifest_bytes = serde_json::to_string_pretty(&self.manifest).map_err(|e| e.to_string())?;
        zip.start_file("manifest.json", options).map_err(|e| e.to_string())?;
        zip.write_all(manifest_bytes.as_bytes()).map_err(|e| e.to_string())?;

        // 2. Write content.mdxl
        zip.start_file("content.mdxl", options).map_err(|e| e.to_string())?;
        zip.write_all(self.content_mdxl.as_bytes()).map_err(|e| e.to_string())?;

        // 3. Write attachments if any
        for (name, data) in &self.attachments {
            let path = format!("attachments/{}", name);
            zip.start_file(&path, options).map_err(|e| e.to_string())?;
            zip.write_all(data).map_err(|e| e.to_string())?;
        }

        let cursor = zip.finish().map_err(|e| e.to_string())?;
        Ok(cursor.into_inner())
    }

    pub fn unpack_from_bytes(bytes: &[u8]) -> Result<Self, String> {
        let mut archive = ZipArchive::new(Cursor::new(bytes)).map_err(|e| e.to_string())?;

        // 1. Read manifest.json
        let manifest: UlyzManifest = {
            let mut file = archive.by_name("manifest.json").map_err(|e| e.to_string())?;
            let mut s = String::new();
            file.read_to_string(&mut s).map_err(|e| e.to_string())?;
            serde_json::from_str(&s).map_err(|e| e.to_string())?
        };

        // 2. Read content.mdxl (or fallback to Content.xml if legacy Ulysses)
        let has_content_mdxl = archive.file_names().any(|n| matches!(n.as_deref(), Ok("content.mdxl")));
        let has_content_xml = archive.file_names().any(|n| matches!(n.as_deref(), Ok("Content.xml")));

        let content_mdxl = if has_content_mdxl {
            let mut file = archive.by_name("content.mdxl").map_err(|e| e.to_string())?;
            let mut s = String::new();
            file.read_to_string(&mut s).map_err(|e| e.to_string())?;
            s
        } else if has_content_xml {
            let mut file = archive.by_name("Content.xml").map_err(|e| e.to_string())?;
            let mut s = String::new();
            file.read_to_string(&mut s).map_err(|e| e.to_string())?;
            s
        } else {
            String::new()
        };

        // 3. Read attachments
        let mut attachments = HashMap::new();
        for i in 0..archive.len() {
            let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
            let name = file.name().map_err(|e| e.to_string())?.to_string();
            if name.starts_with("attachments/") && !name.ends_with('/') {
                let clean_name = name.trim_start_matches("attachments/").to_string();
                let mut data = Vec::new();
                file.read_to_end(&mut data).map_err(|e| e.to_string())?;
                attachments.insert(clean_name, data);
            }
        }

        Ok(Self {
            manifest,
            content_mdxl,
            attachments,
        })
    }

    pub fn pack_to_file(&self, path: &Path) -> Result<(), String> {
        let bytes = self.pack_to_bytes()?;
        std::fs::write(path, bytes).map_err(|e| e.to_string())
    }

    pub fn unpack_from_file(path: &Path) -> Result<Self, String> {
        let bytes = std::fs::read(path).map_err(|e| e.to_string())?;
        Self::unpack_from_bytes(&bytes)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ulyz_package_roundtrip() {
        let mut pkg = UlyzPackage::new("Capítulo 1", "# Capítulo 1\n\nTexto con **Markdown XL**.");
        pkg.manifest.tags = vec!["Borrador".to_string(), "Capítulo".to_string()];
        pkg.attachments.insert("sketch.png".to_string(), vec![1, 2, 3, 4, 5]);

        let packed_bytes = pkg.pack_to_bytes().expect("Failed to pack ulyz");
        assert!(!packed_bytes.is_empty());

        let unpacked = UlyzPackage::unpack_from_bytes(&packed_bytes).expect("Failed to unpack ulyz");
        assert_eq!(unpacked.manifest.title, "Capítulo 1");
        assert_eq!(unpacked.content_mdxl, "# Capítulo 1\n\nTexto con **Markdown XL**.");
        assert_eq!(unpacked.manifest.tags.len(), 2);
        assert_eq!(unpacked.attachments.get("sketch.png"), Some(&vec![1, 2, 3, 4, 5]));
    }
}
