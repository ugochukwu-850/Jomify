// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashSet, path::PathBuf, sync::RwLock};

use menu::{
<<<<<<< HEAD
    auth_structures::User, commands::play_queue, errors::MyError, gear_structures::Track, utils::{
        arc_rwlock_serde, generate_audio_path, generate_search_query, generate_video_path,
=======
    auth_structures::User,
    commands::play_queue,
    gear_structures::Track,
    utils::{
        arc_rwlock_serde,
        generate_audio_path,
        generate_search_query,
        generate_video_path,
>>>>>>> refs/remotes/origin/main
        get_data_from_db,
    }
};
use serde::{Deserialize, Serialize};
use tauri::{api::path::app_data_dir, Manager, WindowEvent};

pub mod menu;
use std::sync::{Arc, Mutex};

#[derive(Debug, Serialize, Deserialize)]
pub struct AppState {
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
            },
            Err(_) => {
                println!("An error occured while generating appstate from db; You should get a clean app state instance");
                Ok(Self::new())
            },
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
        .setup(|app| {
            // Get the platform-specific app directory
            let app_handle = app.app_handle();
            let app_dir =
                Arc::new(app_data_dir(&app_handle.config()).ok_or("Unable to get app directory")?);
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
                .get_window("main")
                .expect("Could not get main windows : This should not be happening");

            //try to get start from db
            let db = app.state::<sled::Db>();
<<<<<<< HEAD
            let state = AppState::new_from_db(&db).expect("This would never fail; thanks to exceptional error handling");
=======
            let state = match get_data_from_db(&db, "app_state") {
                Ok(state) => {
                    println!("Found something");
                    state
                },
                Err(e) => {
                    println!("The error while retrieving the database: {:?}", e);
                    AppState::new()
                }
            };
>>>>>>> refs/remotes/origin/main

            println!("{:?}", state);
            app.manage(state);
            let app_state = app.state::<AppState>();
            let app_queue = app_state.queue.clone();

            // set user into state from DB

            // emit app started
            let _ = app.emit_all("initializate", "App has started please run initialization");

            // listen to the `event-name` (emitted on the `main` window)
            let value = app_dir.clone();
            let window = main_window.clone();
            let main_active_track_processes: Arc<RwLock<HashSet<String>>> =
                Arc::new(RwLock::new(HashSet::new()));
            let matp_handle = main_active_track_processes.clone();
            // process the queue in a rather archaic way
            main_window.listen("process-tracks", move |event| {
                let payload = if let Some(e) = event.payload() {
                    e
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
            menu::commands::search_command
        ])
        .on_window_event(|event| {
            // create a handler closure for default exit and save protocol

            let save_protocol_oo1 = || {
                // Retrieve app handle
                let app_handle = event.window().app_handle();

                // Retrieve db handle from state
                let db = app_handle.state::<sled::Db>();

                // Retrieve app state from state
                let state = app_handle.state::<AppState>();
                let state = &*state;

                println!("Initializing data persist");
<<<<<<< HEAD
                // save to db and exit successfully
                match state.save_to_db(&db) {
                    Ok(former) => println!("Saved succesffuly ; this was the former \n {:?}", former),
                    Err(_) => println!("Something wrong happened ; Failed to save state to db"),
                }

                println!("Data persist successfully . \n Gracefull shutdown");
=======

                // Serialize the state to JSON
                

                // Save to db and exit successfully
                let res = db.insert("app_state", &*serde_json::to_string(state).expect("Failed to load"));
                match res {
                    Ok(Some(e)) => {
                        println!("Data persisted successfully. Former: {:?}", serde_json::from_slice::<AppState>(&e).expect("Failed"));
                    },
                    Ok(None) => {println!("Persisted safely")},
                    Err(err) => {
                        println!("Failed to persist data: {:?}", err);
                    }
                }
                let _ = db.insert("mayo", "Example of a mayonaise");
>>>>>>> refs/remotes/origin/main

                app_handle.exit(0);
            };

            if let WindowEvent::CloseRequested { api, .. } = event.event() {
                // Perform any cleanup before the application closes
                println!("Application is closing...");
                api.prevent_close();
                // run save and exit protocol
                save_protocol_oo1();

                // save the state to db
            } else if let WindowEvent::Destroyed {} = event.event() {
                println!("Window destroyed, performing cleanup.");
                // Perform save and exit protocol
                save_protocol_oo1();
            }
        })
        .run(tauri::generate_context!())
        .expect("An error occured while initializing!!");
}
