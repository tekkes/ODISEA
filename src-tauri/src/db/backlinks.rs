use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use regex::Regex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Backlink {
    pub id: String,
    pub source_sheet_id: String,
    pub source_title: String,
    pub line_number: i32,
    pub anchor_text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutgoingLink {
    pub id: String,
    pub target_sheet_id: String,
    pub target_title: String,
    pub line_number: i32,
    pub anchor_text: String,
}

pub fn record_link(
    conn: &Connection,
    source_sheet_id: &str,
    target_sheet_id: &str,
    line_number: i32,
    anchor_text: &str,
) -> Result<()> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO internal_links (id, source_sheet_id, target_sheet_id, line_number, anchor_text)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![id, source_sheet_id, target_sheet_id, line_number, anchor_text],
    )?;
    Ok(())
}

pub fn sync_sheet_links(conn: &Connection, source_sheet_id: &str, content: &str) -> Result<()> {
    // Delete existing links for this source sheet
    conn.execute(
        "DELETE FROM internal_links WHERE source_sheet_id = ?1",
        params![source_sheet_id],
    )?;

    let re = Regex::new(r"\[\[(.*?)\]\]").unwrap();

    for (line_idx, line) in content.lines().enumerate() {
        for cap in re.captures_iter(line) {
            let target_ref = cap[1].trim();
            if target_ref.is_empty() {
                continue;
            }

            // Look up target sheet by title or id
            let mut stmt = conn.prepare(
                "SELECT id FROM sheets WHERE (lower(title) = lower(?1) OR id = ?1) AND id != ?2 LIMIT 1"
            )?;
            let mut rows = stmt.query_map(params![target_ref, source_sheet_id], |r| r.get::<_, String>(0))?;
            if let Some(target_id) = rows.next() {
                if let Ok(tid) = target_id {
                    let _ = record_link(conn, source_sheet_id, &tid, line_idx as i32 + 1, target_ref);
                }
            }
        }
    }

    Ok(())
}

pub fn get_backlinks_for_sheet(conn: &Connection, sheet_id: &str) -> Result<Vec<Backlink>> {
    let mut stmt = conn.prepare(
        "SELECT l.id, l.source_sheet_id, s.title, l.line_number, l.anchor_text
         FROM internal_links l
         INNER JOIN sheets s ON l.source_sheet_id = s.id
         WHERE l.target_sheet_id = ?1 AND s.deleted_at IS NULL
         ORDER BY s.title ASC"
    )?;

    let rows = stmt.query_map(params![sheet_id], |row| {
        Ok(Backlink {
            id: row.get(0)?,
            source_sheet_id: row.get(1)?,
            source_title: row.get(2)?,
            line_number: row.get(3)?,
            anchor_text: row.get(4)?,
        })
    })?;

    let mut backlinks = Vec::new();
    for link in rows {
        backlinks.push(link?);
    }
    Ok(backlinks)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BacklinkWithContext {
    pub id: String,
    pub source_sheet_id: String,
    pub source_title: String,
    pub group_name: Option<String>,
    pub project_name: Option<String>,
    pub line_number: i32,
    pub anchor_text: String,
    pub snippet: String,
}

pub fn get_backlinks_with_context(conn: &Connection, sheet_id: &str) -> Result<Vec<BacklinkWithContext>> {
    let mut stmt = conn.prepare(
        "SELECT l.id, l.source_sheet_id, s.title, g.name, p.name, l.line_number, l.anchor_text, s.content_mdxl
         FROM internal_links l
         INNER JOIN sheets s ON l.source_sheet_id = s.id
         LEFT JOIN groups g ON s.group_id = g.id
         LEFT JOIN projects p ON g.project_id = p.id
         WHERE l.target_sheet_id = ?1 AND s.deleted_at IS NULL
         ORDER BY s.title ASC"
    )?;

    let rows = stmt.query_map(params![sheet_id], |row| {
        let id: String = row.get(0)?;
        let source_sheet_id: String = row.get(1)?;
        let source_title: String = row.get(2)?;
        let group_name: Option<String> = row.get(3)?;
        let project_name: Option<String> = row.get(4)?;
        let line_number: i32 = row.get(5)?;
        let anchor_text: String = row.get(6)?;
        let content: String = row.get(7)?;

        // Extract context line snippet
        let snippet = if let Some(line) = content.lines().nth(line_number.saturating_sub(1) as usize) {
            line.trim().to_string()
        } else {
            anchor_text.clone()
        };

        Ok(BacklinkWithContext {
            id,
            source_sheet_id,
            source_title,
            group_name,
            project_name,
            line_number,
            anchor_text,
            snippet,
        })
    })?;

    let mut backlinks = Vec::new();
    for link in rows {
        backlinks.push(link?);
    }
    Ok(backlinks)
}


pub fn get_outgoing_links_for_sheet(conn: &Connection, sheet_id: &str) -> Result<Vec<OutgoingLink>> {
    let mut stmt = conn.prepare(
        "SELECT l.id, l.target_sheet_id, s.title, l.line_number, l.anchor_text
         FROM internal_links l
         INNER JOIN sheets s ON l.target_sheet_id = s.id
         WHERE l.source_sheet_id = ?1 AND s.deleted_at IS NULL
         ORDER BY s.title ASC"
    )?;

    let rows = stmt.query_map(params![sheet_id], |row| {
        Ok(OutgoingLink {
            id: row.get(0)?,
            target_sheet_id: row.get(1)?,
            target_title: row.get(2)?,
            line_number: row.get(3)?,
            anchor_text: row.get(4)?,
        })
    })?;

    let mut links = Vec::new();
    for link in rows {
        links.push(link?);
    }
    Ok(links)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::schema::open_in_memory_connection;
    use crate::db::sheets::create_sheet;

    #[test]
    fn test_backlinks_automatic_sync() {
        let conn = open_in_memory_connection().unwrap();

        let s1 = create_sheet(&conn, None, "Personaje Principal", "Biografía de Ulises.").unwrap();
        let s2_content = format!("Capítulo 1 donde aparece [[Personaje Principal]] en la costa.");
        let s2 = create_sheet(&conn, None, "Capítulo 1", &s2_content).unwrap();

        sync_sheet_links(&conn, &s2.id, &s2_content).unwrap();

        let incoming = get_backlinks_for_sheet(&conn, &s1.id).unwrap();
        assert_eq!(incoming.len(), 1);
        assert_eq!(incoming[0].source_sheet_id, s2.id);
        assert_eq!(incoming[0].source_title, "Capítulo 1");

        let outgoing = get_outgoing_links_for_sheet(&conn, &s2.id).unwrap();
        assert_eq!(outgoing.len(), 1);
        assert_eq!(outgoing[0].target_sheet_id, s1.id);
    }
}
