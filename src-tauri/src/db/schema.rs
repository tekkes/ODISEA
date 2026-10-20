use rusqlite::{Connection, Result};
use crate::portable::paths::get_db_path;

pub fn open_connection() -> Result<Connection> {
    let path = get_db_path();
    let conn = Connection::open(path)?;
    conn.execute_batch(
        "PRAGMA foreign_keys = ON;
         PRAGMA journal_mode = WAL;
         PRAGMA synchronous = NORMAL;
         PRAGMA busy_timeout = 5000;"
    )?;
    Ok(conn)
}

pub fn open_in_memory_connection() -> Result<Connection> {
    let conn = Connection::open_in_memory()?;
    conn.execute_batch(
        "PRAGMA foreign_keys = ON;
         PRAGMA synchronous = NORMAL;"
    )?;
    initialize_database(&conn)?;
    Ok(conn)
}

pub fn initialize_database(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            icon TEXT NOT NULL DEFAULT 'book',
            color TEXT NOT NULL DEFAULT '#007aff',
            is_archived INTEGER NOT NULL DEFAULT 0,
            export_style_id TEXT,
            export_format TEXT NOT NULL DEFAULT 'pdf',
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS groups (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            parent_group_id TEXT,
            section_type TEXT NOT NULL DEFAULT 'notes',
            name TEXT NOT NULL,
            icon TEXT NOT NULL DEFAULT 'folder',
            color TEXT NOT NULL DEFAULT '#8e8e93',
            writing_goal_json TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_group_id) REFERENCES groups(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS smart_filters (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            parent_group_id TEXT,
            name TEXT NOT NULL,
            icon TEXT NOT NULL DEFAULT 'filter',
            color TEXT NOT NULL DEFAULT '#af52de',
            rules_json TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_group_id) REFERENCES groups(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS sheets (
            id TEXT PRIMARY KEY,
            group_id TEXT,
            title TEXT NOT NULL DEFAULT '',
            content_mdxl TEXT NOT NULL DEFAULT '',
            markup_dialect TEXT NOT NULL DEFAULT 'markdown_xl',
            is_favorite INTEGER NOT NULL DEFAULT 0,
            is_material INTEGER NOT NULL DEFAULT 0,
            glued_with_next INTEGER NOT NULL DEFAULT 0,
            sort_order INTEGER NOT NULL DEFAULT 0,
            writing_goal_json TEXT,
            publish_status_json TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            deleted_at TEXT,
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS keywords (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            name TEXT NOT NULL,
            color TEXT NOT NULL DEFAULT '#8e8e93',
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS sheet_keywords (
            sheet_id TEXT NOT NULL,
            keyword_id TEXT NOT NULL,
            PRIMARY KEY (sheet_id, keyword_id),
            FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE,
            FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS attachments (
            id TEXT PRIMARY KEY,
            sheet_id TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_name TEXT NOT NULL,
            file_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS internal_links (
            id TEXT PRIMARY KEY,
            source_sheet_id TEXT NOT NULL,
            target_sheet_id TEXT NOT NULL,
            line_number INTEGER NOT NULL DEFAULT 0,
            anchor_text TEXT NOT NULL DEFAULT '',
            FOREIGN KEY (source_sheet_id) REFERENCES sheets(id) ON DELETE CASCADE,
            FOREIGN KEY (target_sheet_id) REFERENCES sheets(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS writing_sessions (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            group_id TEXT,
            project_id TEXT,
            words_written INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
        );

        CREATE VIRTUAL TABLE IF NOT EXISTS sheets_fts USING fts5(
            title,
            content_mdxl,
            content=sheets,
            content_rowid=rowid
        );

        CREATE TRIGGER IF NOT EXISTS sheets_ai AFTER INSERT ON sheets BEGIN
            INSERT INTO sheets_fts(rowid, title, content_mdxl) VALUES (new.rowid, new.title, new.content_mdxl);
        END;

        CREATE TRIGGER IF NOT EXISTS sheets_ad AFTER DELETE ON sheets BEGIN
            INSERT INTO sheets_fts(sheets_fts, rowid, title, content_mdxl) VALUES('delete', old.rowid, old.title, old.content_mdxl);
        END;

        CREATE TRIGGER IF NOT EXISTS sheets_au AFTER UPDATE ON sheets BEGIN
            INSERT INTO sheets_fts(sheets_fts, rowid, title, content_mdxl) VALUES('delete', old.rowid, old.title, old.content_mdxl);
            INSERT INTO sheets_fts(rowid, title, content_mdxl) VALUES (new.rowid, new.title, new.content_mdxl);
        END;"
    )?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_schema_and_triggers_initialization() {
        let conn = open_in_memory_connection().expect("Failed to open in-memory DB");
        
        // Insert sheet and verify FTS trigger works
        conn.execute(
            "INSERT INTO sheets (id, title, content_mdxl, created_at, updated_at) 
             VALUES ('test-1', 'Odisea Ulysses', 'Capítulo de prueba FTS5', '2026-10-19', '2026-10-19')",
            [],
        ).expect("Insert sheet");

        let mut stmt = conn.prepare("SELECT title FROM sheets_fts WHERE sheets_fts MATCH 'Ulysses'").unwrap();
        let match_title: String = stmt.query_row([], |r| r.get(0)).unwrap();
        assert_eq!(match_title, "Odisea Ulysses");
    }
}
