// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashSet, path::PathBuf, sync::RwLock};
use tauri::{Listener, Manager};
use diesel::{Connection, SqliteConnection};
use menu::{
    auth_structures::User,
    commands::play_queue,
    errors::MyError,
    gear_structures::Track,
    utils::{
        arc_rwlock_serde, generate_audio_path, generate_search_query, generate_video_path,
        mutex_option_user_serde,
    },
};
use serde::{Deserialize, Serialize};
use tauri::{path, App, WindowEvent};


pub mod menu;
#[allow(non_snake_case)]
pub mod schema;
use std::sync::Arc;
use tauri::Emitter;
use tauri::async_runtime::Mutex;

#[derive(Debug, Serialize, Deserialize)]
pub struct AppState {
    #[serde(with = "mutex_option_user_serde")]
    pub user: Mutex<Option<User>>,
    #[serde(with = "arc_rwlock_serde")]
    pub queue: Arc<RwLock<JomoQueue>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JomoQueue {
    pub head: Option<u32>,
    pub volume: f32,
    pub que_track: Vec<Track>,
}
impl AppState {
    pub fn new() -> Self {
        Self {
            user: Mutex::new(None),
            queue: Arc::new(RwLock::new(JomoQueue::new())),
        }
    }

    pub fn save_to_db(&self, db: &tauri::State<'_, sled::Db>) -> Result<Self, MyError> {
        match db.insert("app_state", serde_json::to_vec(&self)?) {
            Ok(Some(former)) => Ok(serde_json::from_slice(&former)?),
            Ok(None) => Ok(Self::new()),
            Err(_) => Err(MyError::Custom("Error saving the app state".to_string())),
        }
    }

    pub fn new_from_db(db: &tauri::State<'_, sled::Db>) -> Result<Self, MyError> {
        match db.get("app_state") {
            Ok(Some(former)) => Ok(serde_json::from_slice(&former)?),
            Ok(None) => {
                println!("Found nothing in the db at app state ; so creating a new app state");
                Ok(Self::new())
            }
            Err(_) => {
                println!("An error occured while generating appstate from db; You should get a clean app state instance");
                Ok(Self::new())
            }
        }
    }
}

impl Track {
    pub fn search_query(&self) -> String {
        generate_search_query(
            &self.name,
            &self.artists.iter().map(|f| f.name.to_owned()).collect(),
        )
    }
    pub fn audio_path(&self) -> PathBuf {
        generate_audio_path(
            &self.name,
            &self.artists.iter().map(|f| f.name.to_owned()).collect(),
        )
    }
    pub fn video_path(&self) -> PathBuf {
        generate_video_path(
            &self.name,
            &self.artists.iter().map(|f| f.name.to_owned()).collect(),
        )
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
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            // Get the platform-specific app directory
            let app_handle = app.handle();
            let app_dir =
                Arc::new(app.path().app_data_dir().expect("Unable to get app directory"));
            let db_path: PathBuf = app_dir.clone().join("sled_db");

            // Open or create the Sled database
            let db = sled::open(db_path).expect("Failed to load db");
            println!("Database was recovered: {}", db.was_recovered());

            // Store the database in Tauri's state
            let app = Arc::new(app);
            app.manage(db);

            // `main` here is the window label; it is defined on the window creation or under `tauri.conf.json`
            // the default value is `main`. note that it must be unique
            let main_window = app
                .get_webview_window("main")
                .expect("Could not get main windows : This should not be happening");

            //try to get start from db
            let db = app.state::<sled::Db>();
            let state = AppState::new_from_db(&db)
                .expect("This would never fail; thanks to exceptional error handling");

            app.manage(state);
            let app_state = app.state::<AppState>();
            let app_queue = app_state.queue.clone();

            // set user into state from DB

            // emit app started
            let _ = app.emit("initializate", "App has started please run initialization");

            // listen to the `event-name` (emitted on the `main` window)
            let value = app_dir.clone();
            let window = main_window.clone();
            let main_active_track_processes: Arc<RwLock<HashSet<String>>> =
                Arc::new(RwLock::new(HashSet::new()));
            let matp_handle = main_active_track_processes.clone();
            // process the queue in a rather archaic way
            main_window.listen_any("process-tracks", move |event| {
                println!("Recieved request to play queue");
                let payload = if !event.payload().is_empty() {
                    event.payload()
                } else {
                    return;
                };
                let tracks: Vec<Track> = if let Ok(e) = serde_json::from_str(payload) {
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
                let x = matp_handle.clone();
                tauri::async_runtime::spawn(async move {
                    let _ = menu::commands::process_queue(value, tracks, p_windows, x).await;
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

            // set the connection cursor handle to the sqlite3 db.
            // I am using one connection for ACID'ity

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            menu::commands::sign_in,
            menu::commands::get_tracks,
            menu::commands::is_authenticated,
            menu::commands::home,
            menu::commands::add_to_queue,
            menu::commands::remove_from_playlist,
            menu::commands::download,
            menu::commands::is_downloaded,
            menu::commands::artist_detail,
            menu::commands::artist_albums,
            menu::commands::play_next,
            menu::commands::get_head,
            menu::commands::get_queue,
            menu::commands::search_command,
            menu::commands::get_user_display_name
        ])
        .on_window_event(|window, event| {
            // create a handler closure for default exit and save protocol

            let save_protocol_oo1 = || {
                // Retrieve app handle
                let app_handle = window.app_handle();

                // Retrieve db handle from state
                let db = app_handle.state::<sled::Db>();

                // Retrieve app state from state
                let state = app_handle.state::<AppState>();
                let state = &*state;

                println!("Initializing data persist");
                // save to db and exit successfully
                match state.save_to_db(&db) {
                    Ok(former) => {
                        println!(
                            "Successfully saved :) \n Previous key size : {:?} chunks",
                            serde_json::to_vec(&former).unwrap().len()
                        );
                    }
                    Err(_) => println!("Something wrong happened ; Failed to save state to db"),
                }
                let start = std::time::Instant::now();
                if let Ok(e) = db.flush() {
                    println!(
                        "Flushed {} bytes in {} seconds ",
                        e,
                        (std::time::Instant::now() - start).as_secs_f64()
                    );
                }

                println!("Data persist successfully . \n Gracefull shutdown");

                app_handle.exit(0);
            };

            if let WindowEvent::CloseRequested { api, .. } = event {
                // Perform any cleanup before the application closes
                println!("Application is closing...");
                api.prevent_close();
                // run save and exit protocol
                save_protocol_oo1();

                // save the state to db
            } else if let WindowEvent::Destroyed {} = event {
                println!("Window destroyed, performing cleanup.");
                // Perform save and exit protocol
                save_protocol_oo1();
            }
        })
        .run(tauri::generate_context!())
        .expect("An error occured while initializing!!");
}
