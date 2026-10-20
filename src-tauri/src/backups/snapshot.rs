use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use crate::portable::paths::{get_backups_dir, get_db_path};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupMetadata {
    pub id: String,
    pub filename: String,
    pub backup_type: String, // "hourly" | "daily" | "weekly"
    pub path: String,
    pub size_bytes: u64,
    pub timestamp: String,
}

pub fn create_zstd_snapshot(backup_type: &str) -> Result<PathBuf, String> {
    let db_path = get_db_path();
    if !db_path.exists() {
        return Err("La base de datos todavía no existe".to_string());
    }

    let type_clean = match backup_type {
        "daily" => "daily",
        "weekly" => "weekly",
        _ => "hourly",
    };

    let backups_root = get_backups_dir();
    let target_subfolder = backups_root.join(type_clean);
    if !target_subfolder.exists() {
        let _ = fs::create_dir_all(&target_subfolder);
    }

    let timestamp_str = Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("snapshot_{}_{}.odiseabak.zst", type_clean, timestamp_str);
    let target_path = target_subfolder.join(&filename);

    // Read active database
    let mut db_file = File::open(&db_path).map_err(|e| e.to_string())?;
    let mut raw_bytes = Vec::new();
    db_file.read_to_end(&mut raw_bytes).map_err(|e| e.to_string())?;

    // Zstandard compression (level 3 for great speed & compression ratio)
    let compressed_bytes = zstd::encode_all(raw_bytes.as_slice(), 3).map_err(|e| e.to_string())?;

    let mut out_file = File::create(&target_path).map_err(|e| e.to_string())?;
    out_file.write_all(&compressed_bytes).map_err(|e| e.to_string())?;

    // Apply rotation retention policy
    apply_retention_policy(&target_subfolder, type_clean)?;

    Ok(target_path)
}

fn apply_retention_policy(dir: &Path, backup_type: &str) -> Result<(), String> {
    let max_allowed = match backup_type {
        "hourly" => 12, // Keep last 12 hours
        "daily" => 7,   // Keep last 7 days
        "weekly" => usize::MAX, // Permanent weekly backups
        _ => 12,
    };

    if max_allowed == usize::MAX {
        return Ok(());
    }

    let mut entries = Vec::new();
    if let Ok(dir_entries) = fs::read_dir(dir) {
        for entry in dir_entries.flatten() {
            let path = entry.path();
            if path.extension().map(|e| e == "zst").unwrap_or(false) {
                if let Ok(meta) = fs::metadata(&path) {
                    if let Ok(mod_time) = meta.modified() {
                        entries.push((path, mod_time));
                    }
                }
            }
        }
    }

    // Sort by modified time descending (newest first)
    entries.sort_by(|a, b| b.1.cmp(&a.1));

    // Remove older than max_allowed
    if entries.len() > max_allowed {
        for (old_path, _) in entries.iter().skip(max_allowed) {
            let _ = fs::remove_file(old_path);
        }
    }

    Ok(())
}

pub fn list_all_snapshots() -> Result<Vec<BackupMetadata>, String> {
    let backups_dir = get_backups_dir();
    let mut list = Vec::new();

    let subdirs = ["hourly", "daily", "weekly"];
    for sub in subdirs {
        let sub_path = backups_dir.join(sub);
        if let Ok(entries) = fs::read_dir(&sub_path) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().map(|e| e == "zst").unwrap_or(false) {
                    if let Ok(meta) = fs::metadata(&path) {
                        let filename = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                        let size_bytes = meta.len();
                        let timestamp = meta
                            .modified()
                            .ok()
                            .and_then(|t| chrono::DateTime::<chrono::Utc>::from(t).to_rfc3339().into())
                            .unwrap_or_else(|| Utc::now().to_rfc3339());

                        list.push(BackupMetadata {
                            id: filename.clone(),
                            filename,
                            backup_type: sub.to_string(),
                            path: path.to_string_lossy().to_string(),
                            size_bytes,
                            timestamp,
                        });
                    }
                }
            }
        }
    }

    // Sort newest first
    list.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    Ok(list)
}

pub fn read_snapshot_content(path: &Path) -> Result<Vec<u8>, String> {
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut compressed = Vec::new();
    file.read_to_end(&mut compressed).map_err(|e| e.to_string())?;
    let decompressed = zstd::decode_all(compressed.as_slice()).map_err(|e| e.to_string())?;
    Ok(decompressed)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_zstd_snapshot_creation_and_decompression() {
        let snap_path = create_zstd_snapshot("hourly").expect("Failed to create snapshot");
        assert!(snap_path.exists());

        let raw_bytes = read_snapshot_content(&snap_path).expect("Failed to decompress");
        assert!(!raw_bytes.is_empty());
        // SQLite header starts with "SQLite format 3\0"
        assert!(raw_bytes.starts_with(b"SQLite format 3\0"));

        let list = list_all_snapshots().expect("Failed to list");
        assert!(!list.is_empty());
    }
}
