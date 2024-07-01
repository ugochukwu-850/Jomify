// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    path::PathBuf,
    sync::RwLock,
};

use menu::{
    auth_structures::User,
    commands::play_queue,
    utils::generate_search_query,
};
use rodio::{Decoder, OutputStream, Sink};
use serde::{Deserialize, Serialize};
use tauri::{api::path::app_data_dir, Manager};

pub mod menu;
use std::sync::{Arc, Mutex};

// #[derive(Debug, Serialize, Deserialize)]
pub struct AppState {
    pub user: Mutex<Option<User>>,
    pub sink: Arc<Mutex<Option<Sink>>>,
    pub queue: Arc<RwLock<JomoQueue>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QueTrack {
    pub id: String,
    pub name: String,
    pub artists_names: Vec<String>,
    pub duration_ms: u128,
    pub audio_path: Option<PathBuf>,
    pub video_path: Option<PathBuf>,
    pub image_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JomoQueue {
    pub head: Option<u32>,
    pub volume: f32,
    pub que_track: Vec<QueTrack>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            user: Mutex::new(None),
            sink: Arc::new(Mutex::new(None)),
            queue: Arc::new(RwLock::new(JomoQueue::new())),
        }
    }
}

impl QueTrack {
    pub fn new() -> Self {
        Self {
            id: String::new(),
            name: String::new(),
            artists_names: Vec::new(),
            duration_ms: 0,
            audio_path: None,
            video_path: None,
            image_url: Some(String::new()),
        }
    }

    pub fn search_query(&self) -> String {
        generate_search_query(&self.name, &self.artists_names)
    }
}

impl JomoQueue {
    pub fn new() -> Self {
        Self {
            head: None,
            volume: 1.0,
            que_track: Vec::new(),
        }
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Get the platform-specific app directory
            let app_handle = app.app_handle();
            let app_dir =
                Arc::new(app_data_dir(&app_handle.config()).ok_or("Unable to get app directory")?);
            let db_path: PathBuf = app_dir.clone().join("sled_db");

            // Open or create the Sled database
            let db = sled::open(db_path).expect("Failed to load db");

            // set user into state from DB
            app.manage(AppState::new());

            // Store the database in Tauri's state
            app.manage(db);

            // `main` here is the window label; it is defined on the window creation or under `tauri.conf.json`
            // the default value is `main`. note that it must be unique
            let main_window = app
                .get_window("main")
                .expect("Could not get main windows : This should not be happening");
            let config = app.config();

            let app_queue = app.state::<AppState>().queue.clone();

            // emit app started
            let _ = app.emit_all("initializate", "App has started please run initialization");

            // listen to the `event-name` (emitted on the `main` window)
            let value = config.clone();
            let window = main_window.clone();
            // process the queue in a rather archaic way
            main_window.listen("process-tracks", move |event| {
                let payload = if let Some(e) = event.payload() {e} else {return};
                let tracks: Vec<QueTrack> =
                    if let Ok(e) = serde_json::from_str(payload) {
                        e
                    } else {
                        return;
                    };

                eprintln!(
                    "I have recieved the process tracks request -> Lenght {}",
                    tracks.len()
                );
                let value = value.clone();
                let p_windows = window.clone();
                tauri::async_runtime::spawn(async move {
                    let _ = menu::commands::process_queue(&value, tracks, p_windows).await;
                });
            });

            // play the queue

            let cursor_queue = app_queue.clone();
            let data_dir = app_dir.clone();
            let play_main_window_handle = main_window.clone();
            tauri::async_runtime::spawn(async move {
                eprintln!("I have recieved the play queue request");

                let _ = play_queue(cursor_queue, data_dir, play_main_window_handle);
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            menu::commands::generate_auth_url,
            menu::commands::get_tracks,
            menu::commands::exchange_auth_code,
            menu::commands::is_authenticated,
            menu::commands::home,
            menu::commands::add_to_queue
        ])
        .run(tauri::generate_context!())
        .expect("An error occured while initializing!!");
}
