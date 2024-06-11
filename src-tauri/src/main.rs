// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;

use tauri::{api::path::app_data_dir, Manager};

pub mod menu;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Get the platform-specific app directory
            let app_handle = app.app_handle();
            let app_dir =
                app_data_dir(&app_handle.config()).ok_or("Unable to get app directory")?;
            let db_path: PathBuf = app_dir.join("sled_db");

            // Open or create the Sled database
            let db = sled::open(db_path)?;

            // Store the database in Tauri's state
            app.manage(db);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            menu::commands::generate_auth_url,
            menu::commands::exchange_auth_code,
            menu::commands::is_authenticated
        ])
        .run(tauri::generate_context!())
        .expect("An error occured while initializing!!");
}
