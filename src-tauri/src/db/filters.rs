use rusqlite::{params, Connection, Result};
use crate::db::sheets::Sheet;
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmartFilter {
    pub id: String,
    pub project_id: Option<String>,
    pub parent_group_id: Option<String>,
    pub name: String,
    pub icon: String,
    pub color: String,
    pub rules_json: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterRule {
    pub field: String,      // "text", "keyword", "status", "date_modified"
    pub operator: String,   // "contains", "equals", "not_contains", "is_before", "is_after"
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterDefinition {
    pub name: Option<String>,
    #[serde(default = "default_match_all")]
    pub match_all: bool,
    pub rules: Vec<FilterRule>,
}

fn default_match_all() -> bool {
    true
}

pub fn list_all_sheets(conn: &Connection) -> Result<Vec<Sheet>> {
    let mut stmt = conn.prepare(
        "SELECT id, group_id, title, content_mdxl, markup_dialect, is_favorite, is_material, 
                glued_with_next, sort_order, writing_goal_json, publish_status_json, created_at, updated_at, deleted_at 
         FROM sheets WHERE deleted_at IS NULL ORDER BY updated_at DESC"
    )?;

    let rows = stmt.query_map([], map_sheet)?;
    let mut sheets = Vec::new();
    for sheet in rows {
        sheets.push(sheet?);
    }
    Ok(sheets)
}

pub fn list_last_7_days(conn: &Connection) -> Result<Vec<Sheet>> {
    let cutoff = (Utc::now() - Duration::days(7)).to_rfc3339();
    let mut stmt = conn.prepare(
        "SELECT id, group_id, title, content_mdxl, markup_dialect, is_favorite, is_material, 
                glued_with_next, sort_order, writing_goal_json, publish_status_json, created_at, updated_at, deleted_at 
         FROM sheets WHERE deleted_at IS NULL AND (updated_at >= ?1 OR created_at >= ?1) ORDER BY updated_at DESC"
    )?;

    let rows = stmt.query_map(params![cutoff], map_sheet)?;
    let mut sheets = Vec::new();
    for sheet in rows {
        sheets.push(sheet?);
    }
    Ok(sheets)
}

pub fn list_favorites(conn: &Connection) -> Result<Vec<Sheet>> {
    let mut stmt = conn.prepare(
        "SELECT id, group_id, title, content_mdxl, markup_dialect, is_favorite, is_material, 
                glued_with_next, sort_order, writing_goal_json, publish_status_json, created_at, updated_at, deleted_at 
         FROM sheets WHERE deleted_at IS NULL AND is_favorite = 1 ORDER BY updated_at DESC"
    )?;

    let rows = stmt.query_map([], map_sheet)?;
    let mut sheets = Vec::new();
    for sheet in rows {
        sheets.push(sheet?);
    }
    Ok(sheets)
}

pub fn list_trash(conn: &Connection) -> Result<Vec<Sheet>> {
    let mut stmt = conn.prepare(
        "SELECT id, group_id, title, content_mdxl, markup_dialect, is_favorite, is_material, 
                glued_with_next, sort_order, writing_goal_json, publish_status_json, created_at, updated_at, deleted_at 
         FROM sheets WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
    )?;

    let rows = stmt.query_map([], map_sheet)?;
    let mut sheets = Vec::new();
    for sheet in rows {
        sheets.push(sheet?);
    }
    Ok(sheets)
}

pub fn empty_trash(conn: &Connection) -> Result<usize> {
    let deleted_count = conn.execute("DELETE FROM sheets WHERE deleted_at IS NOT NULL", [])?;
    Ok(deleted_count)
}

// ---------------------------------------------------------------------------
// Smart Filters
// ---------------------------------------------------------------------------

pub fn create_smart_filter(
    conn: &Connection,
    project_id: Option<&str>,
    parent_group_id: Option<&str>,
    name: &str,
    icon: &str,
    color: &str,
    rules_json: &str,
) -> Result<SmartFilter> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO smart_filters (id, project_id, parent_group_id, name, icon, color, rules_json)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![id, project_id, parent_group_id, name, icon, color, rules_json],
    )?;

    Ok(SmartFilter {
        id,
        project_id: project_id.map(|s| s.to_string()),
        parent_group_id: parent_group_id.map(|s| s.to_string()),
        name: name.to_string(),
        icon: icon.to_string(),
        color: color.to_string(),
        rules_json: rules_json.to_string(),
    })
}

pub fn list_smart_filters(conn: &Connection, project_id: Option<&str>) -> Result<Vec<SmartFilter>> {
    let mut stmt = if let Some(_pid) = project_id {
        conn.prepare("SELECT id, project_id, parent_group_id, name, icon, color, rules_json FROM smart_filters WHERE project_id = ?1 ORDER BY name ASC")?
    } else {
        conn.prepare("SELECT id, project_id, parent_group_id, name, icon, color, rules_json FROM smart_filters WHERE project_id IS NULL ORDER BY name ASC")?
    };

    let rows = if let Some(pid) = project_id {
        stmt.query_map(params![pid], map_filter)?
    } else {
        stmt.query_map([], map_filter)?
    };

    let mut list = Vec::new();
    for item in rows {
        list.push(item?);
    }
    Ok(list)
}

pub fn delete_smart_filter(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM smart_filters WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn execute_smart_filter(conn: &Connection, filter_id: &str) -> Result<Vec<Sheet>> {
    let mut stmt = conn.prepare("SELECT rules_json FROM smart_filters WHERE id = ?1")?;
    let rules_str: String = stmt.query_row(params![filter_id], |r| r.get(0))?;

    let def: FilterDefinition = serde_json::from_str(&rules_str).unwrap_or(FilterDefinition {
        name: None,
        match_all: true,
        rules: vec![],
    });

    let all_sheets = list_all_sheets(conn)?;

    let filtered = all_sheets.into_iter().filter(|sheet| {
        if def.rules.is_empty() {
            return true;
        }

        let rule_matches = def.rules.iter().map(|rule| {
            let val = rule.value.to_lowercase();
            match rule.field.as_str() {
                "text" => {
                    let title_match = sheet.title.to_lowercase().contains(&val);
                    let content_match = sheet.content_mdxl.to_lowercase().contains(&val);
                    if rule.operator == "not_contains" {
                        !title_match && !content_match
                    } else {
                        title_match || content_match
                    }
                }
                "status" => {
                    if val == "favorite" {
                        sheet.is_favorite
                    } else if val == "material" {
                        sheet.is_material
                    } else {
                        true
                    }
                }
                "date_modified" | "date_created" => {
                    let target_date = if rule.field == "date_created" {
                        &sheet.created_at
                    } else {
                        &sheet.updated_at
                    };
                    if rule.operator == "is_before" {
                        target_date < &rule.value
                    } else if rule.operator == "is_after" {
                        target_date > &rule.value
                    } else {
                        true
                    }
                }
                _ => true,
            }
        });

        if def.match_all {
            rule_matches.into_iter().all(|m| m)
        } else {
            rule_matches.into_iter().any(|m| m)
        }
    }).collect();

    Ok(filtered)
}

fn map_filter(row: &rusqlite::Row) -> Result<SmartFilter> {
    Ok(SmartFilter {
        id: row.get(0)?,
        project_id: row.get(1)?,
        parent_group_id: row.get(2)?,
        name: row.get(3)?,
        icon: row.get(4)?,
        color: row.get(5)?,
        rules_json: row.get(6)?,
    })
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::schema::open_in_memory_connection;
    use crate::db::sheets::{create_sheet, toggle_favorite, delete_sheet};

    #[test]
    fn test_global_filters_and_smart_filter_execution() {
        let conn = open_in_memory_connection().unwrap();

        let s1 = create_sheet(&conn, None, "Novela Odisea 1", "Texto de prueba").unwrap();
        let s2 = create_sheet(&conn, None, "Ensayo Filosófico", "Texto sobre filosofía").unwrap();

        toggle_favorite(&conn, &s1.id).unwrap();

        let all = list_all_sheets(&conn).unwrap();
        assert_eq!(all.len(), 2);

        let favs = list_favorites(&conn).unwrap();
        assert_eq!(favs.len(), 1);
        assert_eq!(favs[0].id, s1.id);

        let recent = list_last_7_days(&conn).unwrap();
        assert_eq!(recent.len(), 2);

        delete_sheet(&conn, &s2.id).unwrap();
        let trash = list_trash(&conn).unwrap();
        assert_eq!(trash.len(), 1);
        assert_eq!(trash[0].id, s2.id);

        empty_trash(&conn).unwrap();
        assert_eq!(list_trash(&conn).unwrap().len(), 0);

        // Smart filter test
        let filter_rules = r#"{
            "name": "Filtro Odisea",
            "match_all": true,
            "rules": [
                { "field": "text", "operator": "contains", "value": "Odisea" }
            ]
        }"#;
        let sf = create_smart_filter(&conn, None, None, "Filtro Odisea", "filter", "#007aff", filter_rules).unwrap();
        let results = execute_smart_filter(&conn, &sf.id).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].id, s1.id);
    }
}
