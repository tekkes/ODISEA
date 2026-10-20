#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Redirection of WEBVIEW2_USER_DATA_FOLDER to ./odisea_data/webview_profile for 100% forensic portability
    let exe_dir = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|d| d.to_path_buf()))
        .unwrap_or_else(|| std::path::PathBuf::from("."));
    
    let webview_dir = exe_dir.join("odisea_data").join("webview_profile");
    let _ = std::fs::create_dir_all(&webview_dir);
    std::env::set_var("WEBVIEW2_USER_DATA_FOLDER", &webview_dir);

    odisea_lib::run();
}
