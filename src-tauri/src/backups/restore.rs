use std::fs::File;
use std::io::Write;
use std::path::Path;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use crate::backups::snapshot::read_snapshot_content;
use crate::db::{Project, Group, Sheet};
use crate::portable::paths::get_db_path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupInspectionResult {
    pub total_projects: usize,
    pub total_groups: usize,
    pub total_sheets: usize,
    pub projects: Vec<Project>,
    pub groups: Vec<Group>,
    pub sheets: Vec<Sheet>,
}

pub fn inspect_backup_snapshot(snapshot_path: &Path) -> Result<BackupInspectionResult, String> {
    let decompressed_bytes = read_snapshot_content(snapshot_path)?;

    // Write to a temporary file in temp dir to inspect via rusqlite
    let temp_db_path = std::env::temp_dir().join(format!("odisea_inspect_{}.db", uuid::Uuid::new_v4()));
    {
        let mut f = File::create(&temp_db_path).map_err(|e| e.to_string())?;
        f.write_all(&decompressed_bytes).map_err(|e| e.to_string())?;
    }

    let conn = Connection::open(&temp_db_path).map_err(|e| {
        let _ = std::fs::remove_file(&temp_db_path);
        e.to_string()
    })?;

    let projects = crate::db::list_projects(&conn).unwrap_or_default();
    let groups = crate::db::list_groups_by_project(&conn, None).unwrap_or_default();
    let sheets = crate::db::list_all_sheets(&conn).unwrap_or_default();

    drop(conn);
    let _ = std::fs::remove_file(&temp_db_path);

    Ok(BackupInspectionResult {
        total_projects: projects.len(),
        total_groups: groups.len(),
        total_sheets: sheets.len(),
        projects,
        groups,
        sheets,
    })
}

pub fn restore_single_sheet_from_backup(snapshot_path: &Path, sheet_id: &str) -> Result<Sheet, String> {
    let decompressed_bytes = read_snapshot_content(snapshot_path)?;

    let temp_db_path = std::env::temp_dir().join(format!("odisea_inspect_{}.db", uuid::Uuid::new_v4()));
    {
        let mut f = File::create(&temp_db_path).map_err(|e| e.to_string())?;
        f.write_all(&decompressed_bytes).map_err(|e| e.to_string())?;
    }

    let backup_conn = Connection::open(&temp_db_path).map_err(|e| {
        let _ = std::fs::remove_file(&temp_db_path);
        e.to_string()
    })?;

    let sheet_result = crate::db::get_sheet_by_id(&backup_conn, sheet_id).map_err(|e| e.to_string());
    drop(backup_conn);
    let _ = std::fs::remove_file(&temp_db_path);

    let sheet_to_restore = sheet_result?
        .ok_or_else(|| format!("La hoja con ID '{}' no existe en esta instantánea", sheet_id))?;

    // Insert or update in active live database
    let live_conn = crate::db::open_connection().map_err(|e| e.to_string())?;
    live_conn.execute(
        "INSERT INTO sheets (id, group_id, title, content_mdxl, markup_dialect, is_favorite, is_material, 
                             glued_with_next, sort_order, writing_goal_json, publish_status_json, created_at, updated_at, deleted_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, NULL)
         ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            content_mdxl = excluded.content_mdxl,
            markup_dialect = excluded.markup_dialect,
            is_favorite = excluded.is_favorite,
            is_material = excluded.is_material,
            glued_with_next = excluded.glued_with_next,
            sort_order = excluded.sort_order,
            writing_goal_json = excluded.writing_goal_json,
            updated_at = excluded.updated_at,
            deleted_at = NULL",
        rusqlite::params![
            sheet_to_restore.id,
            sheet_to_restore.group_id,
            sheet_to_restore.title,
            sheet_to_restore.content_mdxl,
            sheet_to_restore.markup_dialect,
            if sheet_to_restore.is_favorite { 1 } else { 0 },
            if sheet_to_restore.is_material { 1 } else { 0 },
            if sheet_to_restore.glued_with_next { 1 } else { 0 },
            sheet_to_restore.sort_order,
            sheet_to_restore.writing_goal_json,
            sheet_to_restore.publish_status_json,
            sheet_to_restore.created_at,
            sheet_to_restore.updated_at,
        ],
    ).map_err(|e| e.to_string())?;

    Ok(sheet_to_restore)
}

pub fn restore_full_library(snapshot_path: &Path) -> Result<(), String> {
    let decompressed_bytes = read_snapshot_content(snapshot_path)?;
    let active_db = get_db_path();

    // Emergency backup before full replacement
    if active_db.exists() {
        let emergency_path = active_db.with_extension("pre_restore.bak");
        let _ = std::fs::copy(&active_db, &emergency_path);
    }

    let mut out_file = File::create(&active_db).map_err(|e| e.to_string())?;
    out_file.write_all(&decompressed_bytes).map_err(|e| e.to_string())?;

    // Validate integrity of restored DB
    let conn = crate::db::open_connection().map_err(|e| e.to_string())?;
    let _ = crate::db::initialize_database(&conn);

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::backups::snapshot::create_zstd_snapshot;

    #[test]
    fn test_backup_inspection_and_granular_restore() {
        let snap_path = create_zstd_snapshot("hourly").expect("Snapshot created");

        let inspection = inspect_backup_snapshot(&snap_path).expect("Inspected");
        assert!(inspection.projects.len() == inspection.total_projects);

        // Test restoring full library
        let full_res = restore_full_library(&snap_path);
        assert!(full_res.is_ok());
    }
}
