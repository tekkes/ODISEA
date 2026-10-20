use std::path::Path;
use std::fs;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::portable::config::{load_config, save_config, ExternalFolderConfig};
use crate::external_folders::ulyz_format::UlyzPackage;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternalFileEntry {
    pub id: String,
    pub name: String,
    pub title: String,
    pub path: String,
    pub format: String, // "markdown" | "ulyz"
    pub size_bytes: u64,
    pub modified_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternalSheetContent {
    pub title: String,
    pub content: String,
    pub frontmatter: Option<String>,
    pub html_comment_meta: Option<String>,
    pub markup_dialect: String,
}

// ---------------------------------------------------------------------------
// Markdown Frontmatter & HTML Comment Preservation
// ---------------------------------------------------------------------------

pub fn parse_markdown_content(raw: &str) -> ExternalSheetContent {
    let mut frontmatter = None;
    let mut html_meta = None;
    let mut content = raw.to_string();

    // 1. Detect and extract YAML frontmatter (--- ... ---)
    if raw.starts_with("---\n") || raw.starts_with("---\r\n") {
        let end_marker = "\n---";
        let end_marker_crlf = "\r\n---";
        let search_start = 4;
        let pos = if let Some(p) = raw[search_start..].find(end_marker) {
            Some(search_start + p)
        } else {
            raw[search_start..].find(end_marker_crlf).map(|p| search_start + p)
        };

        if let Some(end_pos) = pos {
            let fm_slice = &raw[..end_pos + 4];
            frontmatter = Some(fm_slice.trim().to_string());
            content = raw[end_pos + 4..].trim_start().to_string();
        }
    }

    // 2. Detect and extract HTML comments for Odisea metadata (<!-- odisea: ... -->)
    if let Some(start) = content.find("<!-- odisea:") {
        if let Some(end) = content[start..].find("-->") {
            let comment_slice = &content[start..start + end + 3];
            html_meta = Some(comment_slice.to_string());
            // Remove comment from editor content to keep typing clean
            content = format!("{}{}", &content[..start], &content[start + end + 3..]).trim().to_string();
        }
    }

    // 3. Extract title from first line starting with # or fallback
    let title = content
        .lines()
        .find(|l| !l.trim().is_empty())
        .map(|l| l.trim().trim_start_matches('#').trim().to_string())
        .unwrap_or_else(|| "Hoja Externa".to_string());

    ExternalSheetContent {
        title,
        content,
        frontmatter,
        html_comment_meta: html_meta,
        markup_dialect: "markdown_xl".to_string(),
    }
}

pub fn serialize_markdown_content(
    frontmatter: Option<&str>,
    html_meta: Option<&str>,
    content: &str,
) -> String {
    let mut output = String::new();

    // Preserve frontmatter at the very top
    if let Some(fm) = frontmatter {
        if !fm.trim().is_empty() {
            output.push_str(fm.trim());
            output.push_str("\n\n");
        }
    }

    // Preserve HTML metadata comment
    if let Some(meta) = html_meta {
        if !meta.trim().is_empty() {
            output.push_str(meta.trim());
            output.push_str("\n\n");
        }
    }

    output.push_str(content);
    output
}

// ---------------------------------------------------------------------------
// External Folder Management (Linked Folders)
// ---------------------------------------------------------------------------

pub fn link_external_folder(name: &str, folder_path: &str, mode: &str) -> Result<ExternalFolderConfig, String> {
    let path = Path::new(folder_path);
    if !path.exists() || !path.is_dir() {
        return Err(format!("El directorio '{}' no existe", folder_path));
    }

    let mut config = load_config();
    let folder_id = Uuid::new_v4().to_string();

    let new_folder = ExternalFolderConfig {
        id: folder_id,
        name: name.to_string(),
        path: folder_path.to_string(),
        mode: mode.to_string(),
    };

    config.external_folders.push(new_folder.clone());
    save_config(&config)?;

    Ok(new_folder)
}

pub fn list_linked_external_folders() -> Vec<ExternalFolderConfig> {
    let config = load_config();
    config.external_folders
}

pub fn unlink_external_folder(folder_id: &str) -> Result<(), String> {
    let mut config = load_config();
    config.external_folders.retain(|f| f.id != folder_id);
    save_config(&config)?;
    Ok(())
}

pub fn scan_external_folder(folder_path: &Path) -> Result<Vec<ExternalFileEntry>, String> {
    if !folder_path.exists() || !folder_path.is_dir() {
        return Err("El directorio no existe".to_string());
    }

    let mut found_files = Vec::new();
    collect_files_recursive(folder_path, &mut found_files)?;

    // Sort by name
    found_files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(found_files)
}

fn collect_files_recursive(dir: &Path, list: &mut Vec<ExternalFileEntry>) -> Result<(), String> {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                // Avoid hidden dirs (.git, .trash, etc)
                if !path.file_name().unwrap_or_default().to_string_lossy().starts_with('.') {
                    let _ = collect_files_recursive(&path, list);
                }
            } else if path.is_file() {
                if let Some(ext) = path.extension() {
                    let ext_str = ext.to_string_lossy().to_lowercase();
                    if ext_str == "md" || ext_str == "txt" || ext_str == "mdxl" || ext_str == "ulyz" || ext_str == "odisea" {
                        let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
                        let file_name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                        let size_bytes = metadata.len();
                        let modified_at = metadata
                            .modified()
                            .ok()
                            .and_then(|t| {
                                chrono::DateTime::<chrono::Utc>::from(t).to_rfc3339().into()
                            })
                            .unwrap_or_else(|| chrono::Utc::now().to_rfc3339());

                        let format = if ext_str == "ulyz" || ext_str == "odisea" {
                            "ulyz".to_string()
                        } else {
                            "markdown".to_string()
                        };

                        let title = path.file_stem().unwrap_or_default().to_string_lossy().to_string();

                        list.push(ExternalFileEntry {
                            id: Uuid::new_v4().to_string(),
                            name: file_name,
                            title,
                            path: path.to_string_lossy().to_string(),
                            format,
                            size_bytes,
                            modified_at,
                        });
                    }
                }
            }
        }
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// External Sheet Read & Write Operations
// ---------------------------------------------------------------------------

pub fn read_external_sheet(path: &Path) -> Result<ExternalSheetContent, String> {
    let ext = path.extension().map(|e| e.to_string_lossy().to_lowercase()).unwrap_or_default();

    if ext == "ulyz" || ext == "odisea" {
        let pkg = UlyzPackage::unpack_from_file(path)?;
        Ok(ExternalSheetContent {
            title: pkg.manifest.title,
            content: pkg.content_mdxl,
            frontmatter: None,
            html_comment_meta: None,
            markup_dialect: pkg.manifest.markup_dialect,
        })
    } else {
        let raw = fs::read_to_string(path).map_err(|e| e.to_string())?;
        Ok(parse_markdown_content(&raw))
    }
}

pub fn write_external_sheet(
    path: &Path,
    title: &str,
    content: &str,
    frontmatter: Option<&str>,
    html_meta: Option<&str>,
) -> Result<(), String> {
    let ext = path.extension().map(|e| e.to_string_lossy().to_lowercase()).unwrap_or_default();

    if ext == "ulyz" || ext == "odisea" {
        let mut pkg = if path.exists() {
            UlyzPackage::unpack_from_file(path).unwrap_or_else(|_| UlyzPackage::new(title, content))
        } else {
            UlyzPackage::new(title, content)
        };
        pkg.manifest.title = title.to_string();
        pkg.manifest.updated_at = chrono::Utc::now().to_rfc3339();
        pkg.content_mdxl = content.to_string();
        pkg.pack_to_file(path)
    } else {
        let serialized = serialize_markdown_content(frontmatter, html_meta, content);
        fs::write(path, serialized).map_err(|e| e.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_markdown_yaml_and_comment_preservation() {
        let raw = r#"---
title: "Documento de Investigación"
author: "Equipo Odisea"
tags: [arquitectura, windows]
---

<!-- odisea: {"dialect":"markdown_xl","is_favorite":true} -->

# Documento de Investigación

Este es el cuerpo principal con **Markdown XL**.
"#;

        let parsed = parse_markdown_content(raw);
        assert_eq!(parsed.title, "Documento de Investigación");
        assert!(parsed.frontmatter.is_some());
        assert!(parsed.frontmatter.unwrap().contains("author: \"Equipo Odisea\""));
        assert!(parsed.html_comment_meta.is_some());
        assert!(parsed.html_comment_meta.unwrap().contains("is_favorite"));
        assert!(parsed.content.contains("# Documento de Investigación"));

        // Test serialization preservation
        let reserialized = serialize_markdown_content(
            Some("---\ntitle: \"Nuevo\"\n---"),
            Some("<!-- odisea: meta -->"),
            "Cuerpo editado.",
        );
        assert!(reserialized.starts_with("---\ntitle: \"Nuevo\"\n---"));
        assert!(reserialized.contains("<!-- odisea: meta -->"));
        assert!(reserialized.contains("Cuerpo editado."));
    }
}
