#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command as StdCommand;
use tauri::Manager;

#[tauri::command]
fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

#[tauri::command]
fn open_in_explorer(path: String) -> Result<(), String> {
    let path = path.replace("/", "\\");
    if std::env::consts::OS == "windows" {
        StdCommand::new("explorer")
            .arg(&format!("/select,{}", path))
            .spawn()
            .map_err(|e| format!("无法打开文件管理器: {}", e))?;
    } else if std::env::consts::OS == "macos" {
        StdCommand::new("open")
            .arg("-R")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("无法打开访达: {}", e))?;
    } else {
        StdCommand::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("无法打开文件管理器: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
fn get_app_info(app_handle: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let config = app_handle.config();
    Ok(serde_json::json!({
        "version": config.version,
        "productName": config.product_name,
        "identifier": config.identifier,
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "dataDir": app_handle.path().app_data_dir()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_default(),
    }))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            get_platform,
            open_in_explorer,
            get_app_info,
        ])
        .setup(|_app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}