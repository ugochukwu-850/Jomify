use std::{
    fmt,
    fs::File,
    path::PathBuf,
    str::FromStr,
    sync::{Arc, Mutex, RwLock},
    thread,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use serde::{
    de::{self, DeserializeOwned, MapAccess, Visitor},
    ser::SerializeStruct,
    Deserialize, Deserializer, Serialize, Serializer,
};

use crate::{
    menu::{auth_structures::User, core_structures::HomeResponse},
    AppState, JomoQueue,
};

use super::{errors::MyError, gear_structures::SimplifiedArtist};

pub fn get_data_from_db<T: DeserializeOwned + Serialize>(
    db: &tauri::State<'_, sled::Db>,
    key: impl AsRef<[u8]>,
) -> Result<T, MyError> {
    if let Some(user) = db.get(key)? {
        return Ok(serde_json::from_slice(&user)?);
    }
    Err(anyhow::anyhow!("Error there is no user in db"))?
}

pub fn generate_search_query(name: &String, artists_names: &Vec<String>) -> String {
    format!("{} by {}", name, artists_names.join(" , "))
}

pub fn generate_audio_path(name: &String, artists_names: &Vec<String>) -> PathBuf {
    PathBuf::from(format!("{} by {}.mp3", name, artists_names.join(" , ")))
}
pub fn generate_video_path(name: &String, artists_names: &Vec<String>) -> PathBuf {
    PathBuf::from(format!("{} by {}.mp4", name, artists_names.join(" , ")))
}

pub fn simple_random() -> u32 {
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    let nanos = duration.subsec_nanos();
    nanos % 1001
}

pub fn wait_read_file(filepath: &PathBuf) -> Result<File, MyError> {
    // Read the file from memory

    if filepath.exists() {
        // wait for four seconds before goind again
        // this is to ensure the file has been completely read before symphony tries to open it

        match File::open(filepath) {
            Ok(val) => return Ok(val),
            Err(e) => {
                // wait for the specified delay before continueing
                eprintln!("Error opening file: {:#?} \n {}", filepath.to_str(), e);

                return Err(MyError::Custom(
                    "Could not find even after several wait".to_string(),
                ));
            }
        };
    } else {
        return Err(MyError::Custom("Could not find file path".to_string()));
    }
}

use std::process::Stdio;
use tauri::{
    api::process::{Command, CommandEvent},
    command, Manager,
};

pub async fn run_ffmpeg_command(
    window: tauri::Window,
    track_id: &String,
    track_name: &String,
    search_query: &String,
    video_path: &PathBuf,
    audio_path: &PathBuf,
) -> Result<(), String> {
    let video_path_str = video_path.to_str().ok_or("Invalid video path")?;
    let audio_path_str = audio_path.to_str().ok_or("Invalid audio path")?;

    // Create the command arguments
    let args = vec![
        "-i",
        video_path_str,
        "-vn",
        "-acodec",
        "libmp3lame",
        audio_path_str,
    ];

    let (mut rx, _child) = Command::new_sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args(args)
        .spawn()
        .map_err(|e| e.to_string())?;

    let mut success = true;

    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(line) => println!("stdout: {}", line),
            CommandEvent::Stderr(line) => eprintln!("stderr: {}", line),
            CommandEvent::Error(line) => eprintln!("error: {}", line),
            CommandEvent::Terminated(status) => {
                success = if status.code.unwrap_or(1) == 0 {
                    true
                } else {
                    false
                };
            }
            _ => {}
        }
    }

    if success {
        // Emit a success message to the frontend
        let _ = window.emit(&format!("downloaded-{}", track_id), "downloaded");
        // Show a success notification
        let _ =
            tauri::api::notification::Notification::new(&window.config().tauri.bundle.identifier)
                .title("S201: Download Success")
                .body(format!(
                    "Successfully downloaded and processed {} ",
                    search_query
                ))
                .show();
    } else {
        // Emit an error message to the frontend
        let _ =
            tauri::api::notification::Notification::new(&window.config().tauri.bundle.identifier)
                .title("E601: Audio Preprocessing Error")
                .body(format!(
                    "FFMPEG RAN INTO AN ERROR WHILE PROCESSING {}",
                    track_name
                ))
                .show();
    }

    Ok(())
}

pub mod arc_rwlock_serde {
    use super::*;
    use std::sync::RwLock;

    pub fn serialize<T, S>(data: &Arc<RwLock<T>>, serializer: S) -> Result<S::Ok, S::Error>
    where
        T: Serialize,
        S: Serializer,
    {
        let data = data.read().expect("RwLock poisoned");
        T::serialize(&*data, serializer)
    }

    pub fn deserialize<'de, T, D>(deserializer: D) -> Result<Arc<RwLock<T>>, D::Error>
    where
        T: Deserialize<'de>,
        D: Deserializer<'de>,
    {
        T::deserialize(deserializer).map(|data| Arc::new(RwLock::new(data)))
    }
}
