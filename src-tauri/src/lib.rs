pub mod portable;
pub mod db;
pub mod external_folders;
pub mod backups;
pub mod ulss_engine;
pub mod publishers;
pub mod revision;

use db::{
    open_connection, initialize_database, Project, Group, Sheet, SmartFilter,
    Keyword, Backlink, OutgoingLink, BacklinkWithContext, SheetAttachment,
};
use portable::{load_config, save_config, OdiseaConfig, ExternalFolderConfig};
use external_folders::{
    link_external_folder, list_linked_external_folders, unlink_external_folder,
    scan_external_folder, read_external_sheet, write_external_sheet,
    ExternalFileEntry, ExternalSheetContent,
};
use backups::{
    create_zstd_snapshot, list_all_snapshots, inspect_backup_snapshot,
    restore_single_sheet_from_backup, restore_full_library,
    BackupMetadata, BackupInspectionResult,
};
use revision::{
    StatisticsEngine, DetailedTextStatistics, WritingGoalData,
    StyleChecker, RevisionIssue, LlmConnector, LlmAssistRequest,
};
use std::path::{Path, PathBuf};


// ---------------------------------------------------------------------------
// Configuration Commands
// ---------------------------------------------------------------------------

#[tauri::command]
fn cmd_get_config() -> OdiseaConfig {
    load_config()
}

#[tauri::command]
fn cmd_save_config(config: OdiseaConfig) -> Result<(), String> {
    save_config(&config)
}

#[tauri::command]
fn cmd_set_theme(theme_id: String, theme_mode: String) -> Result<(), String> {
    let mut config = load_config();
    config.active_theme = theme_id;
    config.theme_mode = theme_mode;
    save_config(&config)
}

#[tauri::command]
fn cmd_save_session_state(
    project_id: Option<String>,
    group_id: Option<String>,
    sheet_id: Option<String>,
    filter: Option<String>,
) -> Result<(), String> {
    portable::config::save_session_state(project_id, group_id, sheet_id, filter)
}

#[tauri::command]
fn cmd_record_history(item: portable::config::HistoryItem) -> Result<(), String> {
    portable::config::record_history(item)
}

#[tauri::command]
fn cmd_get_history() -> Vec<portable::config::HistoryItem> {
    portable::config::get_history()
}

#[tauri::command]
fn cmd_clear_history() -> Result<(), String> {
    portable::config::clear_history()
}


// ---------------------------------------------------------------------------
// Project Commands
// ---------------------------------------------------------------------------

#[tauri::command]
fn cmd_list_projects() -> Result<Vec<Project>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::list_projects(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_create_project(name: String, icon: String, color: String) -> Result<Project, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::create_project(&conn, &name, &icon, &color).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_create_project_from_template(template_type: String, name: String) -> Result<Project, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::create_project_from_template(&conn, &template_type, &name).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_duplicate_project(project_id: String, new_name: Option<String>) -> Result<Project, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::duplicate_project(&conn, &project_id, new_name.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_archive_project(id: String, is_archived: bool) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::archive_project(&conn, &id, is_archived).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_delete_project(id: String) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::delete_project(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_export_project_zip(project_id: String, output_path: Option<String>) -> Result<String, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let path = match output_path {
        Some(p) => PathBuf::from(p),
        None => {
            let export_dir = portable::paths::get_exports_dir();
            export_dir.join(format!("project_{}.zip", project_id))
        }
    };
    db::export_project_zip(&conn, &project_id, &path)
}

// ---------------------------------------------------------------------------
// Group Commands
// ---------------------------------------------------------------------------

#[tauri::command]
fn cmd_list_groups(project_id: Option<String>) -> Result<Vec<Group>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::list_groups_by_project(&conn, project_id.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_create_group(
    project_id: Option<String>,
    parent_group_id: Option<String>,
    section_type: String,
    name: String,
    icon: String,
    color: String,
) -> Result<Group, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::create_group(
        &conn,
        project_id.as_deref(),
        parent_group_id.as_deref(),
        &section_type,
        &name,
        &icon,
        &color,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_update_group(id: String, name: String, icon: String, color: String) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::update_group(&conn, &id, &name, &icon, &color).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_delete_group(id: String) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::delete_group(&conn, &id).map_err(|e| e.to_string())
}

// ---------------------------------------------------------------------------
// Sheet Commands (CRUD, Split, Merge, Glue, Trash)
// ---------------------------------------------------------------------------

#[tauri::command]
fn cmd_list_sheets(group_id: String) -> Result<Vec<Sheet>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::list_sheets_by_group(&conn, &group_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_get_sheet(sheet_id: String) -> Result<Option<Sheet>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::get_sheet_by_id(&conn, &sheet_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_create_sheet(group_id: Option<String>, title: String, content: String) -> Result<Sheet, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::create_sheet(&conn, group_id.as_deref(), &title, &content).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_update_sheet(id: String, title: String, content: String) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::update_sheet_content(&conn, &id, &title, &content).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_update_sheet_date(id: String, created_at: String) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::update_sheet_date(&conn, &id, &created_at).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_toggle_favorite(id: String) -> Result<bool, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::toggle_favorite(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_toggle_material(id: String) -> Result<bool, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::toggle_material(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_toggle_glue(id: String) -> Result<bool, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::toggle_glue(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_split_sheet(id: String, split_offset: usize) -> Result<(Sheet, Sheet), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::split_sheet_at_cursor(&conn, &id, split_offset).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_merge_sheets(sheet_ids: Vec<String>) -> Result<Sheet, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::merge_sheets(&conn, &sheet_ids).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_delete_sheet(id: String) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::delete_sheet(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_restore_sheet(id: String) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::restore_sheet(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_purge_sheet(id: String) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::purge_sheet(&conn, &id).map_err(|e| e.to_string())
}

// ---------------------------------------------------------------------------
// Filters (Global & Smart)
// ---------------------------------------------------------------------------

#[tauri::command]
fn cmd_list_global_filter(filter: String) -> Result<Vec<Sheet>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    match filter.as_str() {
        "all" => db::list_all_sheets(&conn).map_err(|e| e.to_string()),
        "last7days" => db::list_last_7_days(&conn).map_err(|e| e.to_string()),
        "favorites" => db::list_favorites(&conn).map_err(|e| e.to_string()),
        "trash" => db::list_trash(&conn).map_err(|e| e.to_string()),
        _ => db::list_all_sheets(&conn).map_err(|e| e.to_string()),
    }
}

#[tauri::command]
fn cmd_empty_trash() -> Result<usize, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::empty_trash(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_create_smart_filter(
    project_id: Option<String>,
    parent_group_id: Option<String>,
    name: String,
    icon: String,
    color: String,
    rules_json: String,
) -> Result<SmartFilter, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::create_smart_filter(
        &conn,
        project_id.as_deref(),
        parent_group_id.as_deref(),
        &name,
        &icon,
        &color,
        &rules_json,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_list_smart_filters(project_id: Option<String>) -> Result<Vec<SmartFilter>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::list_smart_filters(&conn, project_id.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_execute_smart_filter(filter_id: String) -> Result<Vec<Sheet>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::execute_smart_filter(&conn, &filter_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_delete_smart_filter(id: String) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::delete_smart_filter(&conn, &id).map_err(|e| e.to_string())
}

// ---------------------------------------------------------------------------
// Search, Keywords & Backlinks
// ---------------------------------------------------------------------------

#[tauri::command]
fn cmd_search_sheets(query: String) -> Result<Vec<Sheet>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::search_sheets_fts(&conn, &query).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_attach_keyword(sheet_id: String, keyword_name: String, color: String) -> Result<Keyword, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::attach_keyword_to_sheet(&conn, &sheet_id, &keyword_name, &color).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_detach_keyword(sheet_id: String, keyword_id: String) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::detach_keyword_from_sheet(&conn, &sheet_id, &keyword_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_list_keywords_for_sheet(sheet_id: String) -> Result<Vec<Keyword>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::list_keywords_for_sheet(&conn, &sheet_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_list_keywords(project_id: Option<String>) -> Result<Vec<Keyword>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::list_keywords(&conn, project_id.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_get_backlinks(sheet_id: String) -> Result<Vec<Backlink>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::get_backlinks_for_sheet(&conn, &sheet_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_get_outgoing_links(sheet_id: String) -> Result<Vec<OutgoingLink>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::get_outgoing_links_for_sheet(&conn, &sheet_id).map_err(|e| e.to_string())
}

// ---------------------------------------------------------------------------
// External Folders
// ---------------------------------------------------------------------------

#[tauri::command]
fn cmd_link_external_folder(name: String, folder_path: String, mode: String) -> Result<ExternalFolderConfig, String> {
    link_external_folder(&name, &folder_path, &mode)
}

#[tauri::command]
fn cmd_list_linked_external_folders() -> Vec<ExternalFolderConfig> {
    list_linked_external_folders()
}

#[tauri::command]
fn cmd_unlink_external_folder(folder_id: String) -> Result<(), String> {
    unlink_external_folder(&folder_id)
}

#[tauri::command]
fn cmd_scan_external_folder(folder_path: String) -> Result<Vec<ExternalFileEntry>, String> {
    scan_external_folder(Path::new(&folder_path))
}

#[tauri::command]
fn cmd_read_external_sheet(path: String) -> Result<ExternalSheetContent, String> {
    read_external_sheet(Path::new(&path))
}

#[tauri::command]
fn cmd_write_external_sheet(
    path: String,
    title: String,
    content: String,
    frontmatter: Option<String>,
    html_meta: Option<String>,
) -> Result<(), String> {
    write_external_sheet(
        Path::new(&path),
        &title,
        &content,
        frontmatter.as_deref(),
        html_meta.as_deref(),
    )
}

// ---------------------------------------------------------------------------
// Backups (Zstandard Snapshots & Granular Restore)
// ---------------------------------------------------------------------------

#[tauri::command]
fn cmd_create_backup_snapshot(backup_type: String) -> Result<String, String> {
    let path = create_zstd_snapshot(&backup_type)?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn cmd_list_backup_snapshots() -> Result<Vec<BackupMetadata>, String> {
    list_all_snapshots()
}

#[tauri::command]
fn cmd_inspect_backup_snapshot(snapshot_path: String) -> Result<BackupInspectionResult, String> {
    inspect_backup_snapshot(Path::new(&snapshot_path))
}

#[tauri::command]
fn cmd_restore_single_sheet_from_backup(snapshot_path: String, sheet_id: String) -> Result<Sheet, String> {
    restore_single_sheet_from_backup(Path::new(&snapshot_path), &sheet_id)
}

#[tauri::command]
fn cmd_restore_backup_snapshot(snapshot_path: String) -> Result<(), String> {
    restore_full_library(Path::new(&snapshot_path))
}

// ---------------------------------------------------------------------------
// Text Statistics, Goals & Revision Analysis
// ---------------------------------------------------------------------------

#[tauri::command]
fn cmd_get_statistics(text: String) -> DetailedTextStatistics {
    StatisticsEngine::analyze(&text)
}

#[tauri::command]
fn cmd_calculate_goal_progress(
    current_words: usize,
    goal_json: Option<String>,
) -> Option<WritingGoalData> {
    StatisticsEngine::calculate_goal_progress(current_words, goal_json.as_deref())
}

#[tauri::command]
fn cmd_set_sheet_writing_goal(
    sheet_id: String,
    goal_json: Option<String>,
) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::set_sheet_writing_goal(&conn, &sheet_id, goal_json.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_run_revision_check(text: String) -> Result<Vec<RevisionIssue>, String> {
    Ok(StyleChecker::check_document(&text))
}

#[tauri::command]
fn cmd_llm_assist(
    action: String,
    text: String,
    custom_prompt: Option<String>,
) -> Result<String, String> {
    let config = load_config();
    let req = LlmAssistRequest {
        action,
        text,
        custom_prompt,
    };
    LlmConnector::execute_assist(&config, &req)
}

#[tauri::command]
fn cmd_get_backlinks_with_context(
    sheet_id: String,
) -> Result<Vec<BacklinkWithContext>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::get_backlinks_with_context(&conn, &sheet_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_create_sheet_attachment(
    sheet_id: String,
    file_name: String,
    file_type: String,
    file_hash: String,
) -> Result<SheetAttachment, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::create_attachment(&conn, &sheet_id, &file_type, &file_name, &file_hash).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_list_sheet_attachments(
    sheet_id: String,
) -> Result<Vec<SheetAttachment>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::list_attachments_for_sheet(&conn, &sheet_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cmd_delete_sheet_attachment(
    attachment_id: String,
) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    db::delete_attachment(&conn, &attachment_id).map_err(|e| e.to_string())
}


// ---------------------------------------------------------------------------
// Export & ULSS Engine Commands
// ---------------------------------------------------------------------------

#[tauri::command]
fn cmd_list_styles() -> Result<Vec<String>, String> {
    let styles_dir = portable::paths::get_styles_dir();
    portable::paths::ensure_default_styles(&styles_dir);

    let mut styles = Vec::new();
    if let Ok(entries) = std::fs::read_dir(&styles_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map(|e| e == "ulss").unwrap_or(false) {
                if let Some(file_name) = path.file_name() {
                    styles.push(file_name.to_string_lossy().to_string());
                }
            }
        }
    }
    styles.sort();
    Ok(styles)
}

#[tauri::command]
fn cmd_export_document(
    sheet_id: String,
    format: String,
    style_name: Option<String>,
) -> Result<ulss_engine::ExportResult, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let sheet = db::get_sheet_by_id(&conn, &sheet_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Hoja no encontrada".to_string())?;

    let styles_dir = portable::paths::get_styles_dir();
    let style_file = style_name.unwrap_or_else(|| "Swiss Knife.ulss".to_string());
    let style_path = styles_dir.join(&style_file);

    let exports_dir = portable::paths::get_exports_dir();

    // Check if sheet is glued with next sheets: gather all glued content in order!
    let mut full_content = sheet.content_mdxl.clone();
    if sheet.glued_with_next {
        if let Some(group_id) = &sheet.group_id {
            if let Ok(all_sheets) = db::list_sheets_by_group(&conn, group_id) {
                let mut found_current = false;
                for s in all_sheets {
                    if s.id == sheet.id {
                        found_current = true;
                        continue;
                    }
                    if found_current {
                        full_content.push_str("\n\n---\n\n");
                        full_content.push_str(&s.content_mdxl);
                        if !s.glued_with_next {
                            break;
                        }
                    }
                }
            }
        }
    }

    ulss_engine::export_document_to_format(
        &format,
        &sheet.title,
        &full_content,
        &style_path,
        &exports_dir,
    )
}

#[tauri::command]
fn cmd_preview_export(
    sheet_id: String,
    style_name: Option<String>,
) -> Result<String, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let sheet = db::get_sheet_by_id(&conn, &sheet_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Hoja no encontrada".to_string())?;

    let styles_dir = portable::paths::get_styles_dir();
    let style_file = style_name.unwrap_or_else(|| "Swiss Knife.ulss".to_string());
    let style_path = styles_dir.join(&style_file);

    let ulss_content = if style_path.exists() {
        std::fs::read_to_string(&style_path).unwrap_or_default()
    } else {
        include_str!("../../reference_samples/sample_style.ulss").to_string()
    };

    let stylesheet = ulss_engine::UlssParser::parse_stylesheet(&ulss_content)
        .unwrap_or_else(|_| ulss_engine::UlssStylesheet::default());
    let is_revision = style_file.to_lowercase().contains("revision");

    let exporter = ulss_engine::HtmlTextExporter::new(&stylesheet, is_revision);
    Ok(exporter.export_html_snippet(&sheet.title, &sheet.content_mdxl))
}

// ---------------------------------------------------------------------------
// Publishers Commands (WordPress, Ghost, Medium, Micro.blog, Substack)
// ---------------------------------------------------------------------------

#[tauri::command]
fn cmd_get_publish_accounts() -> portable::config::PublishersConfig {
    let config = load_config();
    config.publishers
}

#[tauri::command]
fn cmd_save_publish_accounts(publishers: portable::config::PublishersConfig) -> Result<(), String> {
    let mut config = load_config();
    config.publishers = publishers;
    save_config(&config)
}

#[tauri::command]
fn cmd_publish_to_wordpress(
    sheet_id: String,
    account_name: String,
    status: String,
    scheduled_date: Option<String>,
    categories: Vec<u32>,
    tags: Vec<u32>,
) -> Result<publishers::PublishResult, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let sheet = db::get_sheet_by_id(&conn, &sheet_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Hoja no encontrada".to_string())?;

    let config = load_config();
    let account = config.publishers.wordpress
        .iter()
        .find(|a| a.name == account_name || account_name.is_empty())
        .ok_or_else(|| "Cuenta de WordPress no encontrada".to_string())?;

    let mut existing_post_id = None;
    if let Some(ref st_json) = sheet.publish_status_json {
        if let Ok(val) = serde_json::from_str::<serde_json::Value>(st_json) {
            if val["platform"].as_str() == Some("wordpress") {
                if let Some(pid) = val["post_id"].as_str() {
                    if !pid.is_empty() {
                        existing_post_id = Some(pid.to_string());
                    }
                }
            }
        }
    }

    let ulss_content = include_str!("../../reference_samples/sample_style.ulss");
    let stylesheet = ulss_engine::UlssParser::parse_stylesheet(ulss_content).unwrap_or_default();
    let exporter = ulss_engine::HtmlTextExporter::new(&stylesheet, false);
    let html_content = exporter.export_html_snippet(&sheet.title, &sheet.content_mdxl);

    let params = publishers::WordPressPublishParams {
        post_id: existing_post_id,
        title: sheet.title.clone(),
        content_html: html_content,
        status,
        scheduled_date,
        categories,
        tags,
        featured_media_id: None,
    };

    let result = publishers::WordPressPublisher::publish_or_update(account, &params)?;

    let status_json = serde_json::to_string(&result).map_err(|e| e.to_string())?;
    let _ = db::set_sheet_publish_status(&conn, &sheet.id, Some(&status_json));

    Ok(result)
}

#[tauri::command]
fn cmd_publish_to_ghost(
    sheet_id: String,
    account_name: String,
    status: String,
    scheduled_date: Option<String>,
    tags: Vec<String>,
) -> Result<publishers::PublishResult, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let sheet = db::get_sheet_by_id(&conn, &sheet_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Hoja no encontrada".to_string())?;

    let config = load_config();
    let account = config.publishers.ghost
        .iter()
        .find(|a| a.name == account_name || account_name.is_empty())
        .ok_or_else(|| "Cuenta de Ghost no encontrada".to_string())?;

    let mut existing_post_id = None;
    let mut updated_at = None;
    if let Some(ref st_json) = sheet.publish_status_json {
        if let Ok(val) = serde_json::from_str::<serde_json::Value>(st_json) {
            if val["platform"].as_str() == Some("ghost") {
                if let Some(pid) = val["post_id"].as_str() {
                    if !pid.is_empty() {
                        existing_post_id = Some(pid.to_string());
                    }
                }
                if let Some(upd) = val["published_at"].as_str() {
                    updated_at = Some(upd.to_string());
                }
            }
        }
    }

    let ulss_content = include_str!("../../reference_samples/sample_style.ulss");
    let stylesheet = ulss_engine::UlssParser::parse_stylesheet(ulss_content).unwrap_or_default();
    let exporter = ulss_engine::HtmlTextExporter::new(&stylesheet, false);
    let html_content = exporter.export_html_snippet(&sheet.title, &sheet.content_mdxl);

    let params = publishers::GhostPublishParams {
        post_id: existing_post_id,
        title: sheet.title.clone(),
        content_html: html_content,
        status,
        scheduled_date,
        tags,
        feature_image_url: None,
        updated_at,
    };

    let result = publishers::GhostPublisher::publish_or_update(account, &params)?;

    let status_json = serde_json::to_string(&result).map_err(|e| e.to_string())?;
    let _ = db::set_sheet_publish_status(&conn, &sheet.id, Some(&status_json));

    Ok(result)
}

#[tauri::command]
fn cmd_publish_to_medium(
    sheet_id: String,
    account_name: String,
    status: String,
    tags: Vec<String>,
) -> Result<publishers::PublishResult, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let sheet = db::get_sheet_by_id(&conn, &sheet_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Hoja no encontrada".to_string())?;

    let config = load_config();
    let account = config.publishers.medium
        .iter()
        .find(|a| a.name == account_name || account_name.is_empty())
        .ok_or_else(|| "Cuenta de Medium no encontrada".to_string())?;

    let ulss_content = include_str!("../../reference_samples/sample_style.ulss");
    let stylesheet = ulss_engine::UlssParser::parse_stylesheet(ulss_content).unwrap_or_default();
    let exporter = ulss_engine::HtmlTextExporter::new(&stylesheet, false);
    let html_content = exporter.export_html_snippet(&sheet.title, &sheet.content_mdxl);

    let params = publishers::MediumPublishParams {
        title: sheet.title.clone(),
        content_html: html_content,
        publish_status: status,
        tags,
        canonical_url: None,
    };

    let result = publishers::MediumPublisher::publish(account, &params)?;

    let status_json = serde_json::to_string(&result).map_err(|e| e.to_string())?;
    let _ = db::set_sheet_publish_status(&conn, &sheet.id, Some(&status_json));

    Ok(result)
}

#[tauri::command]
fn cmd_publish_to_microblog(
    sheet_id: String,
    account_name: String,
    categories: Vec<String>,
    slug: Option<String>,
) -> Result<publishers::PublishResult, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let sheet = db::get_sheet_by_id(&conn, &sheet_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Hoja no encontrada".to_string())?;

    let config = load_config();
    let account = config.publishers.microblog
        .iter()
        .find(|a| a.name == account_name || account_name.is_empty())
        .ok_or_else(|| "Cuenta de Micro.blog no encontrada".to_string())?;

    let mut existing_url = None;
    if let Some(ref st_json) = sheet.publish_status_json {
        if let Ok(val) = serde_json::from_str::<serde_json::Value>(st_json) {
            if val["platform"].as_str() == Some("microblog") {
                if let Some(u) = val["url"].as_str() {
                    if !u.is_empty() {
                        existing_url = Some(u.to_string());
                    }
                }
            }
        }
    }

    let ulss_content = include_str!("../../reference_samples/sample_style.ulss");
    let stylesheet = ulss_engine::UlssParser::parse_stylesheet(ulss_content).unwrap_or_default();
    let exporter = ulss_engine::HtmlTextExporter::new(&stylesheet, false);
    let html_content = exporter.export_html_snippet(&sheet.title, &sheet.content_mdxl);

    let params = publishers::MicroBlogPublishParams {
        post_url: existing_url,
        title: Some(sheet.title.clone()),
        content_html: html_content,
        categories,
        slug,
    };

    let result = publishers::MicroBlogPublisher::publish_or_update(account, &params)?;

    let status_json = serde_json::to_string(&result).map_err(|e| e.to_string())?;
    let _ = db::set_sheet_publish_status(&conn, &sheet.id, Some(&status_json));

    Ok(result)
}

#[tauri::command]
fn cmd_copy_for_substack(
    sheet_id: String,
) -> Result<publishers::SubstackCopyResult, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let sheet = db::get_sheet_by_id(&conn, &sheet_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Hoja no encontrada".to_string())?;

    Ok(publishers::SubstackFormatter::format_for_substack(&sheet.title, &sheet.content_mdxl))
}

pub fn run() {

    // 1. Initialize portable paths & environment variables
    portable::initialize_portable_environment();

    // 2. Initialize database schema
    if let Ok(conn) = open_connection() {
        let _ = initialize_database(&conn);
    }

    // 3. Start automatic backups scheduler
    let _ = backups::BackupScheduler::start();

    // 4. Build and run Tauri application
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // Config & Session & History
            cmd_get_config,
            cmd_save_config,
            cmd_set_theme,
            cmd_save_session_state,
            cmd_record_history,
            cmd_get_history,
            cmd_clear_history,
            // Projects
            cmd_list_projects,
            cmd_create_project,
            cmd_create_project_from_template,
            cmd_duplicate_project,
            cmd_archive_project,
            cmd_delete_project,
            cmd_export_project_zip,
            // Groups
            cmd_list_groups,
            cmd_create_group,
            cmd_update_group,
            cmd_delete_group,
            // Sheets
            cmd_list_sheets,
            cmd_get_sheet,
            cmd_create_sheet,
            cmd_update_sheet,
            cmd_update_sheet_date,
            cmd_toggle_favorite,
            cmd_toggle_material,
            cmd_toggle_glue,
            cmd_split_sheet,
            cmd_merge_sheets,
            cmd_delete_sheet,
            cmd_restore_sheet,
            cmd_purge_sheet,
            // Filters
            cmd_list_global_filter,
            cmd_empty_trash,
            cmd_create_smart_filter,
            cmd_list_smart_filters,
            cmd_execute_smart_filter,
            cmd_delete_smart_filter,
            // Search, Keywords & Backlinks
            cmd_search_sheets,
            cmd_attach_keyword,
            cmd_detach_keyword,
            cmd_list_keywords_for_sheet,
            cmd_list_keywords,
            cmd_get_backlinks,
            cmd_get_outgoing_links,
            // External Folders
            cmd_link_external_folder,
            cmd_list_linked_external_folders,
            cmd_unlink_external_folder,
            cmd_scan_external_folder,
            cmd_read_external_sheet,
            cmd_write_external_sheet,
            // Backups
            cmd_create_backup_snapshot,
            cmd_list_backup_snapshots,
            cmd_inspect_backup_snapshot,
            cmd_restore_single_sheet_from_backup,
            cmd_restore_backup_snapshot,
            // Statistics, Goals & Revision
            cmd_get_statistics,
            cmd_calculate_goal_progress,
            cmd_set_sheet_writing_goal,
            cmd_run_revision_check,
            cmd_llm_assist,
            cmd_get_backlinks_with_context,
            cmd_create_sheet_attachment,
            cmd_list_sheet_attachments,
            cmd_delete_sheet_attachment,
            // ULSS Engine & Export
            cmd_list_styles,
            cmd_export_document,
            cmd_preview_export,
            // Publishing Connectors
            cmd_get_publish_accounts,
            cmd_save_publish_accounts,
            cmd_publish_to_wordpress,
            cmd_publish_to_ghost,
            cmd_publish_to_medium,
            cmd_publish_to_microblog,
            cmd_copy_for_substack
        ])
        .run(tauri::generate_context!())
        .expect("error while running Odisea application");
}
