use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Keyword {
    pub id: String,
    pub project_id: Option<String>,
    pub name: String,
    pub color: String,
}

pub fn list_keywords(conn: &Connection, project_id: Option<&str>) -> Result<Vec<Keyword>> {
    let mut stmt = if let Some(_pid) = project_id {
        conn.prepare("SELECT id, project_id, name, color FROM keywords WHERE project_id = ?1 ORDER BY name ASC")?
    } else {
        conn.prepare("SELECT id, project_id, name, color FROM keywords ORDER BY name ASC")?
    };

    let rows = if let Some(pid) = project_id {
        stmt.query_map(params![pid], map_kw)?
    } else {
        stmt.query_map([], map_kw)?
    };

    let mut keywords = Vec::new();
    for kw in rows {
        keywords.push(kw?);
    }
    Ok(keywords)
}

fn map_kw(row: &rusqlite::Row) -> Result<Keyword> {
    Ok(Keyword {
        id: row.get(0)?,
        project_id: row.get(1)?,
        name: row.get(2)?,
        color: row.get(3)?,
    })
}

pub fn create_keyword(conn: &Connection, project_id: Option<&str>, name: &str, color: &str) -> Result<Keyword> {
    // Check if keyword already exists in this pool
    let mut check_stmt = if let Some(_pid) = project_id {
        conn.prepare("SELECT id, project_id, name, color FROM keywords WHERE project_id = ?1 AND lower(name) = lower(?2)")?
    } else {
        conn.prepare("SELECT id, project_id, name, color FROM keywords WHERE project_id IS NULL AND lower(name) = lower(?1)")?
    };

    let mut existing = if let Some(pid) = project_id {
        check_stmt.query_map(params![pid, name], map_kw)?
    } else {
        check_stmt.query_map(params![name], map_kw)?
    };

    if let Some(kw) = existing.next() {
        return Ok(kw?);
    }

    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO keywords (id, project_id, name, color) VALUES (?1, ?2, ?3, ?4)",
        params![id, project_id, name, color],
    )?;

    Ok(Keyword {
        id,
        project_id: project_id.map(|s| s.to_string()),
        name: name.to_string(),
        color: color.to_string(),
    })
}

pub fn attach_keyword_to_sheet(conn: &Connection, sheet_id: &str, keyword_name: &str, color: &str) -> Result<Keyword> {
    // Find active project for this sheet
    let mut p_stmt = conn.prepare(
        "SELECT g.project_id FROM sheets s 
         LEFT JOIN groups g ON s.group_id = g.id 
         WHERE s.id = ?1"
    )?;
    let project_id: Option<String> = p_stmt.query_row(params![sheet_id], |r| r.get(0)).unwrap_or(None);

    // Get or create keyword restricted to this project's pool
    let kw = create_keyword(conn, project_id.as_deref(), keyword_name, color)?;

    conn.execute(
        "INSERT OR IGNORE INTO sheet_keywords (sheet_id, keyword_id) VALUES (?1, ?2)",
        params![sheet_id, kw.id],
    )?;

    Ok(kw)
}

pub fn detach_keyword_from_sheet(conn: &Connection, sheet_id: &str, keyword_id: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM sheet_keywords WHERE sheet_id = ?1 AND keyword_id = ?2",
        params![sheet_id, keyword_id],
    )?;
    Ok(())
}

pub fn list_keywords_for_sheet(conn: &Connection, sheet_id: &str) -> Result<Vec<Keyword>> {
    let mut stmt = conn.prepare(
        "SELECT k.id, k.project_id, k.name, k.color 
         FROM keywords k 
         INNER JOIN sheet_keywords sk ON k.id = sk.keyword_id 
         WHERE sk.sheet_id = ?1 ORDER BY k.name ASC"
    )?;

    let rows = stmt.query_map(params![sheet_id], map_kw)?;
    let mut keywords = Vec::new();
    for kw in rows {
        keywords.push(kw?);
    }
    Ok(keywords)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::schema::open_in_memory_connection;
    use crate::db::sheets::create_sheet;

    #[test]
    fn test_keyword_pool_and_sheet_attachment() {
        let conn = open_in_memory_connection().unwrap();

        let s = create_sheet(&conn, None, "Hoja con Tags", "Contenido").unwrap();

        let kw1 = attach_keyword_to_sheet(&conn, &s.id, "Borrador", "#ff9f0a").unwrap();
        let kw2 = attach_keyword_to_sheet(&conn, &s.id, "Capítulo 1", "#0a84ff").unwrap();

        let sheet_kws = list_keywords_for_sheet(&conn, &s.id).unwrap();
        assert_eq!(sheet_kws.len(), 2);

        detach_keyword_from_sheet(&conn, &s.id, &kw1.id).unwrap();
        let after_detach = list_keywords_for_sheet(&conn, &s.id).unwrap();
        assert_eq!(after_detach.len(), 1);
        assert_eq!(after_detach[0].id, kw2.id);
    }
}
