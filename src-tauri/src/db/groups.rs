use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Group {
    pub id: String,
    pub project_id: Option<String>,
    pub parent_group_id: Option<String>,
    pub section_type: String,
    pub name: String,
    pub icon: String,
    pub color: String,
    pub writing_goal_json: Option<String>,
    pub sort_order: i32,
}

pub fn list_groups_by_project(conn: &Connection, project_id: Option<&str>) -> Result<Vec<Group>> {
    let mut stmt = if let Some(_pid) = project_id {
        conn.prepare(
            "SELECT id, project_id, parent_group_id, section_type, name, icon, color, writing_goal_json, sort_order 
             FROM groups WHERE project_id = ?1 ORDER BY sort_order ASC, name ASC"
        )?
    } else {
        conn.prepare(
            "SELECT id, project_id, parent_group_id, section_type, name, icon, color, writing_goal_json, sort_order 
             FROM groups WHERE project_id IS NULL ORDER BY sort_order ASC, name ASC"
        )?
    };

    let rows = if let Some(pid) = project_id {
        stmt.query_map(params![pid], map_group)?
    } else {
        stmt.query_map([], map_group)?
    };

    let mut groups = Vec::new();
    for group in rows {
        groups.push(group?);
    }
    Ok(groups)
}

pub fn get_group(conn: &Connection, id: &str) -> Result<Option<Group>> {
    let mut stmt = conn.prepare(
        "SELECT id, project_id, parent_group_id, section_type, name, icon, color, writing_goal_json, sort_order 
         FROM groups WHERE id = ?1"
    )?;
    let mut rows = stmt.query_map(params![id], map_group)?;
    if let Some(g) = rows.next() {
        Ok(Some(g?))
    } else {
        Ok(None)
    }
}

fn map_group(row: &rusqlite::Row) -> Result<Group> {
    Ok(Group {
        id: row.get(0)?,
        project_id: row.get(1)?,
        parent_group_id: row.get(2)?,
        section_type: row.get(3)?,
        name: row.get(4)?,
        icon: row.get(5)?,
        color: row.get(6)?,
        writing_goal_json: row.get(7)?,
        sort_order: row.get(8)?,
    })
}

pub fn create_group(
    conn: &Connection,
    project_id: Option<&str>,
    parent_group_id: Option<&str>,
    section_type: &str,
    name: &str,
    icon: &str,
    color: &str,
) -> Result<Group> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO groups (id, project_id, parent_group_id, section_type, name, icon, color, sort_order)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0)",
        params![id, project_id, parent_group_id, section_type, name, icon, color],
    )?;

    Ok(Group {
        id,
        project_id: project_id.map(|s| s.to_string()),
        parent_group_id: parent_group_id.map(|s| s.to_string()),
        section_type: section_type.to_string(),
        name: name.to_string(),
        icon: icon.to_string(),
        color: color.to_string(),
        writing_goal_json: None,
        sort_order: 0,
    })
}

pub fn update_group(conn: &Connection, id: &str, name: &str, icon: &str, color: &str) -> Result<()> {
    conn.execute(
        "UPDATE groups SET name = ?1, icon = ?2, color = ?3 WHERE id = ?4",
        params![name, icon, color, id],
    )?;
    Ok(())
}

pub fn set_group_writing_goal(conn: &Connection, id: &str, goal_json: Option<&str>) -> Result<()> {
    conn.execute(
        "UPDATE groups SET writing_goal_json = ?1 WHERE id = ?2",
        params![goal_json, id],
    )?;
    Ok(())
}

pub fn move_group(conn: &Connection, id: &str, new_parent_id: Option<&str>, new_sort_order: i32) -> Result<()> {
    conn.execute(
        "UPDATE groups SET parent_group_id = ?1, sort_order = ?2 WHERE id = ?3",
        params![new_parent_id, new_sort_order, id],
    )?;
    Ok(())
}

pub fn delete_group(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM groups WHERE id = ?1", params![id])?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::schema::open_in_memory_connection;

    #[test]
    fn test_group_hierarchy_and_goals() {
        let conn = open_in_memory_connection().unwrap();

        let parent = create_group(&conn, None, None, "notes", "Ideas Generales", "folder", "#007aff").unwrap();
        let child = create_group(&conn, None, Some(&parent.id), "notes", "Personajes", "user", "#30d158").unwrap();

        assert_eq!(child.parent_group_id, Some(parent.id.clone()));

        set_group_writing_goal(&conn, &parent.id, Some(r#"{"target_words": 1500}"#)).unwrap();
        let updated = get_group(&conn, &parent.id).unwrap().unwrap();
        assert_eq!(updated.writing_goal_json, Some(r#"{"target_words": 1500}"#.to_string()));

        let groups = list_groups_by_project(&conn, None).unwrap();
        assert_eq!(groups.len(), 2);
    }
}
