use rusqlite::{params, Connection, Result};
use crate::db::sheets::Sheet;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FtsSearchResult {
    pub sheet: Sheet,
    pub snippet: String,
    pub rank: f64,
}

pub fn search_sheets_fts(conn: &Connection, query: &str) -> Result<Vec<Sheet>> {
    let clean_query = query.trim();
    if clean_query.is_empty() {
        return Ok(vec![]);
    }

    let formatted_query = format!("\"{}\"*", clean_query.replace('"', ""));
    let mut stmt = conn.prepare(
        "SELECT s.id, s.group_id, s.title, s.content_mdxl, s.markup_dialect, s.is_favorite, s.is_material, 
                s.glued_with_next, s.sort_order, s.writing_goal_json, s.publish_status_json, s.created_at, s.updated_at, s.deleted_at
         FROM sheets s
         JOIN sheets_fts fts ON s.rowid = fts.rowid
         WHERE sheets_fts MATCH ?1 AND s.deleted_at IS NULL
         ORDER BY bm25(sheets_fts) ASC"
    )?;

    let rows = stmt.query_map(params![formatted_query], |row| {
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
    })?;

    let mut sheets = Vec::new();
    for sheet in rows {
        sheets.push(sheet?);
    }
    Ok(sheets)
}

pub fn search_sheets_with_snippets(conn: &Connection, query: &str) -> Result<Vec<FtsSearchResult>> {
    let clean_query = query.trim();
    if clean_query.is_empty() {
        return Ok(vec![]);
    }

    let formatted_query = format!("\"{}\"*", clean_query.replace('"', ""));
    let mut stmt = conn.prepare(
        "SELECT s.id, s.group_id, s.title, s.content_mdxl, s.markup_dialect, s.is_favorite, s.is_material, 
                s.glued_with_next, s.sort_order, s.writing_goal_json, s.publish_status_json, s.created_at, s.updated_at, s.deleted_at,
                snippet(sheets_fts, 1, '<b>', '</b>', '...', 16),
                bm25(sheets_fts)
         FROM sheets s
         JOIN sheets_fts fts ON s.rowid = fts.rowid
         WHERE sheets_fts MATCH ?1 AND s.deleted_at IS NULL
         ORDER BY bm25(sheets_fts) ASC"
    )?;

    let rows = stmt.query_map(params![formatted_query], |row| {
        let sheet = Sheet {
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
        };
        let snippet: String = row.get(14).unwrap_or_default();
        let rank: f64 = row.get(15).unwrap_or(0.0);

        Ok(FtsSearchResult {
            sheet,
            snippet,
            rank,
        })
    })?;

    let mut results = Vec::new();
    for res in rows {
        results.push(res?);
    }
    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::schema::open_in_memory_connection;
    use crate::db::sheets::create_sheet;

    #[test]
    fn test_fts5_search_and_bm25_snippets() {
        let conn = open_in_memory_connection().unwrap();

        create_sheet(&conn, None, "Arquitectura REA", "El principio de evidencia REA guía toda Odisea.").unwrap();
        create_sheet(&conn, None, "Capítulo 2", "Continuando el viaje hacia la isla de Ítaca.").unwrap();

        let results = search_sheets_fts(&conn, "evidencia").unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].title, "Arquitectura REA");

        let snippet_results = search_sheets_with_snippets(&conn, "Ítaca").unwrap();
        assert_eq!(snippet_results.len(), 1);
        assert!(snippet_results[0].snippet.contains("Ítaca"));
    }
}
