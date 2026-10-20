use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use std::collections::HashMap;
use std::io::Write;
use std::path::Path;
use std::fs::File;
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub color: String,
    pub is_archived: bool,
    pub export_style_id: Option<String>,
    pub export_format: String,
    pub sort_order: i32,
    pub created_at: String,
    pub updated_at: String,
}

pub fn list_projects(conn: &Connection) -> Result<Vec<Project>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, icon, color, is_archived, export_style_id, export_format, sort_order, created_at, updated_at 
         FROM projects ORDER BY sort_order ASC, name ASC"
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(Project {
            id: row.get(0)?,
            name: row.get(1)?,
            icon: row.get(2)?,
            color: row.get(3)?,
            is_archived: row.get::<_, i32>(4)? != 0,
            export_style_id: row.get(5)?,
            export_format: row.get(6)?,
            sort_order: row.get(7)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    })?;

    let mut projects = Vec::new();
    for project in rows {
        projects.push(project?);
    }
    Ok(projects)
}

pub fn get_project(conn: &Connection, id: &str) -> Result<Option<Project>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, icon, color, is_archived, export_style_id, export_format, sort_order, created_at, updated_at 
         FROM projects WHERE id = ?1"
    )?;
    let mut rows = stmt.query_map(params![id], |row| {
        Ok(Project {
            id: row.get(0)?,
            name: row.get(1)?,
            icon: row.get(2)?,
            color: row.get(3)?,
            is_archived: row.get::<_, i32>(4)? != 0,
            export_style_id: row.get(5)?,
            export_format: row.get(6)?,
            sort_order: row.get(7)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    })?;

    if let Some(p) = rows.next() {
        Ok(Some(p?))
    } else {
        Ok(None)
    }
}

pub fn create_project(conn: &Connection, name: &str, icon: &str, color: &str) -> Result<Project> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let sort_order = 0;

    conn.execute(
        "INSERT INTO projects (id, name, icon, color, is_archived, export_style_id, export_format, sort_order, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, 0, NULL, 'pdf', ?5, ?6, ?7)",
        params![id, name, icon, color, sort_order, now, now],
    )?;

    // Default Sections: Main Content, Extras
    let main_group_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO groups (id, project_id, parent_group_id, section_type, name, icon, color, sort_order)
         VALUES (?1, ?2, NULL, 'main', 'Contenido Principal', 'book-open', ?3, 0)",
        params![main_group_id, id, color],
    )?;

    let extras_group_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO groups (id, project_id, parent_group_id, section_type, name, icon, color, sort_order)
         VALUES (?1, ?2, NULL, 'extras', 'Investigación y Extras', 'archive', '#8e8e93', 1)",
        params![extras_group_id, id],
    )?;

    Ok(Project {
        id,
        name: name.to_string(),
        icon: icon.to_string(),
        color: color.to_string(),
        is_archived: false,
        export_style_id: None,
        export_format: "pdf".to_string(),
        sort_order,
        created_at: now.clone(),
        updated_at: now,
    })
}

pub fn create_project_from_template(conn: &Connection, template_type: &str, name: &str) -> Result<Project> {
    let (icon, color) = match template_type {
        "novel" => ("feather", "#0a84ff"),
        "academic" => ("graduation-cap", "#5e5ce6"),
        "manual" => ("terminal", "#30d158"),
        _ => ("book", "#ff9f0a"),
    };

    let project = create_project(conn, name, icon, color)?;

    match template_type {
        "novel" => {
            // Add chapters and character groups
            let chapters_id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO groups (id, project_id, parent_group_id, section_type, name, icon, color, sort_order)
                 VALUES (?1, ?2, NULL, 'main', 'Capítulos', 'book', ?3, 10)",
                params![chapters_id, project.id, color],
            )?;

            let chars_id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO groups (id, project_id, parent_group_id, section_type, name, icon, color, sort_order)
                 VALUES (?1, ?2, NULL, 'extras', 'Personajes y Arcos', 'users', '#ff375f', 20)",
                params![chars_id, project.id],
            )?;

            // Seed first chapter sheet
            let sheet_id = Uuid::new_v4().to_string();
            let now = Utc::now().to_rfc3339();
            conn.execute(
                "INSERT INTO sheets (id, group_id, title, content_mdxl, created_at, updated_at)
                 VALUES (?1, ?2, 'Capítulo 1: El Comienzo', '# Capítulo 1\n\nEra una tarde luminosa...', ?3, ?4)",
                params![sheet_id, chapters_id, now, now],
            )?;
        }
        "academic" => {
            let sections = [
                ("1. Introducción y Estado del Arte", "H1"),
                ("2. Metodología Experimental", "H2"),
                ("3. Resultados y Discusión", "H3"),
                ("4. Conclusiones y Futuro", "H4"),
                ("5. Bibliografía", "H5"),
            ];
            for (idx, (sec_name, _)) in sections.iter().enumerate() {
                let g_id = Uuid::new_v4().to_string();
                conn.execute(
                    "INSERT INTO groups (id, project_id, parent_group_id, section_type, name, icon, color, sort_order)
                     VALUES (?1, ?2, NULL, 'main', ?3, 'file-text', ?4, ?5)",
                    params![g_id, project.id, sec_name, color, idx as i32 + 5],
                )?;
            }
        }
        "manual" => {
            let modules = ["1. Visión General", "2. Instalación", "3. Configuración", "4. Comandos CLI"];
            for (idx, mod_name) in modules.iter().enumerate() {
                let g_id = Uuid::new_v4().to_string();
                conn.execute(
                    "INSERT INTO groups (id, project_id, parent_group_id, section_type, name, icon, color, sort_order)
                     VALUES (?1, ?2, NULL, 'main', ?3, 'code', ?4, ?5)",
                    params![g_id, project.id, mod_name, color, idx as i32 + 5],
                )?;
            }
        }
        _ => {}
    }

    Ok(project)
}

pub fn duplicate_project(conn: &Connection, source_project_id: &str, new_name: Option<&str>) -> Result<Project> {
    let source = get_project(conn, source_project_id)?
        .ok_or_else(|| rusqlite::Error::QueryReturnedNoRows)?;

    let default_name = format!("{} (Copia)", source.name);
    let name = new_name.unwrap_or(&default_name);
    let new_project_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO projects (id, name, icon, color, is_archived, export_style_id, export_format, sort_order, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, 0, ?5, ?6, ?7, ?8, ?9)",
        params![new_project_id, name, source.icon, source.color, source.export_style_id, source.export_format, source.sort_order + 1, now, now],
    )?;

    // Map old group IDs to new group IDs
    let mut group_map: HashMap<String, String> = HashMap::new();

    let mut stmt = conn.prepare("SELECT id, section_type, name, icon, color, writing_goal_json, sort_order FROM groups WHERE project_id = ?1")?;
    let groups = stmt.query_map(params![source_project_id], |r| {
        Ok((
            r.get::<_, String>(0)?,
            r.get::<_, String>(1)?,
            r.get::<_, String>(2)?,
            r.get::<_, String>(3)?,
            r.get::<_, String>(4)?,
            r.get::<_, Option<String>>(5)?,
            r.get::<_, i32>(6)?,
        ))
    })?;

    for g in groups {
        let (old_id, section_type, g_name, g_icon, g_color, goal_json, sort_order) = g?;
        let new_g_id = Uuid::new_v4().to_string();
        group_map.insert(old_id, new_g_id.clone());

        conn.execute(
            "INSERT INTO groups (id, project_id, parent_group_id, section_type, name, icon, color, writing_goal_json, sort_order)
             VALUES (?1, ?2, NULL, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![new_g_id, new_project_id, section_type, g_name, g_icon, g_color, goal_json, sort_order],
        )?;
    }

    // Duplicate sheets for each mapped group
    for (old_g_id, new_g_id) in &group_map {
        let mut s_stmt = conn.prepare("SELECT title, content_mdxl, markup_dialect, is_favorite, is_material, glued_with_next, sort_order, writing_goal_json FROM sheets WHERE group_id = ?1 AND deleted_at IS NULL")?;
        let sheets = s_stmt.query_map(params![old_g_id], |r| {
            Ok((
                r.get::<_, String>(0)?,
                r.get::<_, String>(1)?,
                r.get::<_, String>(2)?,
                r.get::<_, i32>(3)?,
                r.get::<_, i32>(4)?,
                r.get::<_, i32>(5)?,
                r.get::<_, i32>(6)?,
                r.get::<_, Option<String>>(7)?,
            ))
        })?;

        for s in sheets {
            let (title, content, dialect, fav, mat, glued, sort, goal) = s?;
            let new_sheet_id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO sheets (id, group_id, title, content_mdxl, markup_dialect, is_favorite, is_material, glued_with_next, sort_order, writing_goal_json, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
                params![new_sheet_id, new_g_id, title, content, dialect, fav, mat, glued, sort, goal, now, now],
            )?;
        }
    }

    Ok(Project {
        id: new_project_id,
        name: name.to_string(),
        icon: source.icon,
        color: source.color,
        is_archived: false,
        export_style_id: source.export_style_id,
        export_format: source.export_format,
        sort_order: source.sort_order + 1,
        created_at: now.clone(),
        updated_at: now,
    })
}

pub fn export_project_zip(conn: &Connection, project_id: &str, output_path: &Path) -> std::result::Result<String, String> {
    let project = get_project(conn, project_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Proyecto no encontrado".to_string())?;

    let file = File::create(output_path).map_err(|e| e.to_string())?;
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    // Write project manifest JSON
    let manifest = serde_json::to_string_pretty(&project).map_err(|e| e.to_string())?;
    zip.start_file("odisea_project.json", options).map_err(|e| e.to_string())?;
    zip.write_all(manifest.as_bytes()).map_err(|e| e.to_string())?;

    // Query groups
    let mut g_stmt = conn.prepare("SELECT id, name FROM groups WHERE project_id = ?1").map_err(|e| e.to_string())?;
    let groups = g_stmt.query_map(params![project_id], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)))
        .map_err(|e| e.to_string())?;

    for g in groups {
        let (g_id, g_name) = g.map_err(|e| e.to_string())?;
        let safe_group_name = g_name.replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_");

        let mut s_stmt = conn.prepare("SELECT title, content_mdxl FROM sheets WHERE group_id = ?1 AND deleted_at IS NULL")
            .map_err(|e| e.to_string())?;
        let sheets = s_stmt.query_map(params![g_id], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)))
            .map_err(|e| e.to_string())?;

        let mut idx = 1;
        for s in sheets {
            let (title, content) = s.map_err(|e| e.to_string())?;
            let safe_title = if title.trim().is_empty() {
                format!("Hoja_{}", idx)
            } else {
                title.replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_")
            };
            let zip_entry_name = format!("{}/{:02}_{}.mdxl", safe_group_name, idx, safe_title);
            zip.start_file(&zip_entry_name, options).map_err(|e| e.to_string())?;
            zip.write_all(content.as_bytes()).map_err(|e| e.to_string())?;
            idx += 1;
        }
    }

    zip.finish().map_err(|e| e.to_string())?;
    Ok(output_path.to_string_lossy().to_string())
}

pub fn archive_project(conn: &Connection, id: &str, is_archived: bool) -> Result<()> {
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE projects SET is_archived = ?1, updated_at = ?2 WHERE id = ?3",
        params![if is_archived { 1 } else { 0 }, now, id],
    )?;
    Ok(())
}

pub fn delete_project(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM projects WHERE id = ?1", params![id])?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::schema::open_in_memory_connection;

    #[test]
    fn test_project_crud_and_duplication() {
        let conn = open_in_memory_connection().unwrap();

        let proj = create_project(&conn, "Mi Gran Novela", "feather", "#007aff").unwrap();
        assert_eq!(proj.name, "Mi Gran Novela");
        assert!(!proj.is_archived);

        archive_project(&conn, &proj.id, true).unwrap();
        let updated = get_project(&conn, &proj.id).unwrap().unwrap();
        assert!(updated.is_archived);

        let cloned = duplicate_project(&conn, &proj.id, Some("Novela Clonada")).unwrap();
        assert_eq!(cloned.name, "Novela Clonada");
        assert_ne!(cloned.id, proj.id);

        let list = list_projects(&conn).unwrap();
        assert_eq!(list.len(), 2);

        delete_project(&conn, &cloned.id).unwrap();
        let after_del = list_projects(&conn).unwrap();
        assert_eq!(after_del.len(), 1);
    }

    #[test]
    fn test_create_project_from_template() {
        let conn = open_in_memory_connection().unwrap();
        let proj = create_project_from_template(&conn, "novel", "Odisea en el Espacio").unwrap();
        assert_eq!(proj.name, "Odisea en el Espacio");

        let mut stmt = conn.prepare("SELECT count(*) FROM groups WHERE project_id = ?1").unwrap();
        let count: i32 = stmt.query_row(params![proj.id], |r| r.get(0)).unwrap();
        assert!(count >= 3);
    }
}
