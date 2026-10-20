use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sheet {
    pub id: String,
    pub group_id: Option<String>,
    pub title: String,
    pub content_mdxl: String,
    pub markup_dialect: String,
    pub is_favorite: bool,
    pub is_material: bool,
    pub glued_with_next: bool,
    pub sort_order: i32,
    pub writing_goal_json: Option<String>,
    pub publish_status_json: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}

pub fn list_sheets_by_group(conn: &Connection, group_id: &str) -> Result<Vec<Sheet>> {
    let mut stmt = conn.prepare(
        "SELECT id, group_id, title, content_mdxl, markup_dialect, is_favorite, is_material, 
                glued_with_next, sort_order, writing_goal_json, publish_status_json, created_at, updated_at, deleted_at 
         FROM sheets WHERE group_id = ?1 AND deleted_at IS NULL ORDER BY sort_order ASC, created_at DESC"
    )?;

    let rows = stmt.query_map(params![group_id], map_sheet)?;
    let mut sheets = Vec::new();
    for sheet in rows {
        sheets.push(sheet?);
    }
    Ok(sheets)
}

pub fn get_sheet_by_id(conn: &Connection, sheet_id: &str) -> Result<Option<Sheet>> {
    let mut stmt = conn.prepare(
        "SELECT id, group_id, title, content_mdxl, markup_dialect, is_favorite, is_material, 
                glued_with_next, sort_order, writing_goal_json, publish_status_json, created_at, updated_at, deleted_at 
         FROM sheets WHERE id = ?1"
    )?;

    let mut rows = stmt.query_map(params![sheet_id], map_sheet)?;
    if let Some(sheet) = rows.next() {
        Ok(Some(sheet?))
    } else {
        Ok(None)
    }
}

fn map_sheet(row: &rusqlite::Row) -> Result<Sheet> {
    Ok(Sheet {
        id: row.get(0)?,
        group_id: row.get(1)?,
        title: row.get(2)?,
        content_mdxl: row.get(3)?,
        markup_dialect: row.get(4)?,
        is_favorite: row.get::<_, i32>(5)? != 0,
        is_material: row.get::<_, i32>(6)? != 0,
        glued_with_next: row.get::<_, i32>(7)? != 0,
        sort_order: row.get(8)?,
        writing_goal_json: row.get(9)?,
        publish_status_json: row.get(10)?,
        created_at: row.get(11)?,
        updated_at: row.get(12)?,
        deleted_at: row.get(13)?,
    })
}

pub fn create_sheet(conn: &Connection, group_id: Option<&str>, title: &str, content: &str) -> Result<Sheet> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO sheets (id, group_id, title, content_mdxl, markup_dialect, is_favorite, is_material, 
                             glued_with_next, sort_order, writing_goal_json, publish_status_json, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, 'markdown_xl', 0, 0, 0, 0, NULL, NULL, ?5, ?6)",
        params![id, group_id, title, content, now, now],
    )?;

    Ok(Sheet {
        id,
        group_id: group_id.map(|s| s.to_string()),
        title: title.to_string(),
        content_mdxl: content.to_string(),
        markup_dialect: "markdown_xl".to_string(),
        is_favorite: false,
        is_material: false,
        glued_with_next: false,
        sort_order: 0,
        writing_goal_json: None,
        publish_status_json: None,
        created_at: now.clone(),
        updated_at: now,
        deleted_at: None,
    })
}

pub fn update_sheet_content(conn: &Connection, id: &str, title: &str, content: &str) -> Result<()> {
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE sheets SET title = ?1, content_mdxl = ?2, updated_at = ?3 WHERE id = ?4",
        params![title, content, now, id],
    )?;

    // Scan content for wiki backlinks [[Target Sheet Title]] and sync internal_links
    let _ = crate::db::backlinks::sync_sheet_links(conn, id, content);

    Ok(())
}

pub fn update_sheet_date(conn: &Connection, id: &str, new_created_at: &str) -> Result<()> {
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE sheets SET created_at = ?1, updated_at = ?2 WHERE id = ?3",
        params![new_created_at, now, id],
    )?;
    Ok(())
}

pub fn toggle_favorite(conn: &Connection, id: &str) -> Result<bool> {
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE sheets SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END, updated_at = ?1 WHERE id = ?2",
        params![now, id],
    )?;
    let mut stmt = conn.prepare("SELECT is_favorite FROM sheets WHERE id = ?1")?;
    let fav: i32 = stmt.query_row(params![id], |r| r.get(0))?;
    Ok(fav != 0)
}

pub fn toggle_material(conn: &Connection, id: &str) -> Result<bool> {
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE sheets SET is_material = CASE WHEN is_material = 1 THEN 0 ELSE 1 END, updated_at = ?1 WHERE id = ?2",
        params![now, id],
    )?;
    let mut stmt = conn.prepare("SELECT is_material FROM sheets WHERE id = ?1")?;
    let mat: i32 = stmt.query_row(params![id], |r| r.get(0))?;
    Ok(mat != 0)
}

pub fn toggle_glue(conn: &Connection, id: &str) -> Result<bool> {
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE sheets SET glued_with_next = CASE WHEN glued_with_next = 1 THEN 0 ELSE 1 END, updated_at = ?1 WHERE id = ?2",
        params![now, id],
    )?;
    let mut stmt = conn.prepare("SELECT glued_with_next FROM sheets WHERE id = ?1")?;
    let glued: i32 = stmt.query_row(params![id], |r| r.get(0))?;
    Ok(glued != 0)
}

pub fn set_glue(conn: &Connection, id: &str, glued: bool) -> Result<()> {
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE sheets SET glued_with_next = ?1, updated_at = ?2 WHERE id = ?3",
        params![if glued { 1 } else { 0 }, now, id],
    )?;
    Ok(())
}

pub fn delete_sheet(conn: &Connection, id: &str) -> Result<()> {
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE sheets SET deleted_at = ?1 WHERE id = ?2",
        params![now, id],
    )?;
    Ok(())
}

pub fn restore_sheet(conn: &Connection, id: &str) -> Result<()> {
    conn.execute(
        "UPDATE sheets SET deleted_at = NULL WHERE id = ?1",
        params![id],
    )?;
    Ok(())
}

pub fn purge_sheet(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM sheets WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn split_sheet_at_cursor(conn: &Connection, sheet_id: &str, split_offset: usize) -> Result<(Sheet, Sheet)> {
    let original = get_sheet_by_id(conn, sheet_id)?
        .ok_or_else(|| rusqlite::Error::QueryReturnedNoRows)?;

    let content = &original.content_mdxl;
    let safe_offset = if split_offset > content.len() {
        content.len()
    } else {
        // Ensure split on valid char boundary
        let mut idx = split_offset;
        while idx > 0 && !content.is_char_boundary(idx) {
            idx -= 1;
        }
        idx
    };

    let part1 = &content[..safe_offset];
    let part2 = content[safe_offset..].trim_start_matches(['\r', '\n']);

    // Derive second sheet title from first line of part2 if any
    let part2_title = part2
        .lines()
        .find(|l| !l.trim().is_empty())
        .map(|l| l.trim().trim_start_matches('#').trim().to_string())
        .unwrap_or_else(|| format!("{} (Parte 2)", original.title));

    // Update first sheet
    update_sheet_content(conn, &original.id, &original.title, part1)?;

    // Create second sheet right after
    let now = Utc::now().to_rfc3339();
    let new_id = Uuid::new_v4().to_string();
    let new_sort = original.sort_order + 1;

    conn.execute(
        "INSERT INTO sheets (id, group_id, title, content_mdxl, markup_dialect, is_favorite, is_material, 
                             glued_with_next, sort_order, writing_goal_json, publish_status_json, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, ?7, ?8, NULL, NULL, ?9, ?10)",
        params![
            new_id,
            original.group_id,
            part2_title,
            part2,
            original.markup_dialect,
            if original.is_material { 1 } else { 0 },
            if original.glued_with_next { 1 } else { 0 },
            new_sort,
            now,
            now,
        ],
    )?;

    let sheet1 = get_sheet_by_id(conn, &original.id)?.unwrap();
    let sheet2 = get_sheet_by_id(conn, &new_id)?.unwrap();
    Ok((sheet1, sheet2))
}

pub fn merge_sheets(conn: &Connection, sheet_ids: &[String]) -> Result<Sheet> {
    if sheet_ids.is_empty() {
        return Err(rusqlite::Error::QueryReturnedNoRows);
    }

    let first_id = &sheet_ids[0];
    let master = get_sheet_by_id(conn, first_id)?
        .ok_or_else(|| rusqlite::Error::QueryReturnedNoRows)?;

    let mut merged_content = master.content_mdxl.clone();

    for id in sheet_ids.iter().skip(1) {
        if let Some(other) = get_sheet_by_id(conn, id)? {
            if !merged_content.is_empty() && !other.content_mdxl.is_empty() {
                merged_content.push_str("\n\n");
            }
            merged_content.push_str(&other.content_mdxl);
            // Soft delete merged sheet
            delete_sheet(conn, id)?;
        }
    }

    update_sheet_content(conn, &master.id, &master.title, &merged_content)?;
    let updated_master = get_sheet_by_id(conn, &master.id)?.unwrap();
    Ok(updated_master)
}

pub fn set_sheet_writing_goal(conn: &Connection, id: &str, goal_json: Option<&str>) -> Result<()> {
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE sheets SET writing_goal_json = ?1, updated_at = ?2 WHERE id = ?3",
        params![goal_json, now, id],
    )?;
    Ok(())
}

pub fn set_sheet_publish_status(conn: &Connection, id: &str, status_json: Option<&str>) -> Result<()> {
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE sheets SET publish_status_json = ?1, updated_at = ?2 WHERE id = ?3",
        params![status_json, now, id],
    )?;
    Ok(())
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SheetAttachment {
    pub id: String,
    pub sheet_id: String,
    pub file_type: String,
    pub file_name: String,
    pub file_hash: String,
    pub created_at: String,
}

pub fn create_attachment(
    conn: &Connection,
    sheet_id: &str,
    file_type: &str,
    file_name: &str,
    file_hash: &str,
) -> Result<SheetAttachment> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO attachments (id, sheet_id, file_type, file_name, file_hash, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, sheet_id, file_type, file_name, file_hash, now],
    )?;
    Ok(SheetAttachment {
        id,
        sheet_id: sheet_id.to_string(),
        file_type: file_type.to_string(),
        file_name: file_name.to_string(),
        file_hash: file_hash.to_string(),
        created_at: now,
    })
}

pub fn list_attachments_for_sheet(conn: &Connection, sheet_id: &str) -> Result<Vec<SheetAttachment>> {
    let mut stmt = conn.prepare(
        "SELECT id, sheet_id, file_type, file_name, file_hash, created_at
         FROM attachments WHERE sheet_id = ?1 ORDER BY created_at DESC"
    )?;
    let rows = stmt.query_map(params![sheet_id], |row| {
        Ok(SheetAttachment {
            id: row.get(0)?,
            sheet_id: row.get(1)?,
            file_type: row.get(2)?,
            file_name: row.get(3)?,
            file_hash: row.get(4)?,
            created_at: row.get(5)?,
        })
    })?;

    let mut attachments = Vec::new();
    for a in rows {
        attachments.push(a?);
    }
    Ok(attachments)
}

pub fn delete_attachment(conn: &Connection, attachment_id: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM attachments WHERE id = ?1",
        params![attachment_id],
    )?;
    Ok(())
}


#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::schema::open_in_memory_connection;

    #[test]
    fn test_sheet_crud_favorite_and_trash() {
        let conn = open_in_memory_connection().unwrap();

        let s = create_sheet(&conn, None, "Mi Hoja", "Texto inicial").unwrap();
        assert_eq!(s.title, "Mi Hoja");
        assert!(!s.is_favorite);

        let fav = toggle_favorite(&conn, &s.id).unwrap();
        assert!(fav);

        delete_sheet(&conn, &s.id).unwrap();
        let fetched = get_sheet_by_id(&conn, &s.id).unwrap().unwrap();
        assert!(fetched.deleted_at.is_some());

        restore_sheet(&conn, &s.id).unwrap();
        let restored = get_sheet_by_id(&conn, &s.id).unwrap().unwrap();
        assert!(restored.deleted_at.is_none());
    }

    #[test]
    fn test_split_and_merge_sheets() {
        let conn = open_in_memory_connection().unwrap();

        let text = "Párrafo 1 con contenido.\nPárrafo 2 con más ideas.";
        let s = create_sheet(&conn, None, "Documento", text).unwrap();

        // Split after Párrafo 1
        let (s1, s2) = split_sheet_at_cursor(&conn, &s.id, 25).unwrap();
        assert!(s1.content_mdxl.contains("Párrafo 1"));
        assert!(s2.content_mdxl.contains("Párrafo 2"));

        // Merge them back
        let merged = merge_sheets(&conn, &[s1.id.clone(), s2.id.clone()]).unwrap();
        assert!(merged.content_mdxl.contains("Párrafo 1"));
        assert!(merged.content_mdxl.contains("Párrafo 2"));

        // s2 must now be deleted
        let s2_after = get_sheet_by_id(&conn, &s2.id).unwrap().unwrap();
        assert!(s2_after.deleted_at.is_some());
    }
}
