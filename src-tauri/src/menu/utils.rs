use std::{
    fs::File,
    net::TcpListener,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
};

use diesel::{Connection, SqliteConnection};
use serde::{
    // de::DeserializeOwned,
    de::DeserializeOwned,
    Deserialize,
    Deserializer,
    Serialize,
    Serializer,
};
use tauri::Emitter;
use tauri_plugin_notification::NotificationExt;
use tauri_plugin_shell::{process::CommandEvent, ShellExt};
use super::{errors::MyError, models::Track};

pub fn get_data_from_db<T: DeserializeOwned + Serialize>(
    db: &tauri::State<'_, sled::Db>,
    key: impl AsRef<[u8]>,
) -> Result<T, MyError> {
    if let Some(user) = db.get(key)? {
        let user: T = serde_json::from_slice(&user)?;
        return Ok(user);
    } else {
        Err(anyhow::anyhow!("Error there is no user in db"))?
    }
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

use tauri::{Manager, WebviewWindow};

pub async fn run_ffmpeg_command(
    window: WebviewWindow,
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

    let (mut rx, _child) = window.app_handle().shell().sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args(args)
        .spawn()
        .map_err(|e| e.to_string())?;

    let mut success = true;

    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(line) => println!("stdout: {:?}", line),
            CommandEvent::Stderr(line) => eprintln!("stderr: {:?}", line),
            CommandEvent::Error(line) => eprintln!("error: {:?}", line),
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
            window.app_handle().notification().builder()
                .title("S201: Download Success")
                .body(format!(
                    "Successfully downloaded and processed {} ",
                    search_query
                ))
                .show();
    } else {
        // Emit an error message to the frontend
        let _ =
            window.app_handle().notification().builder()
                .title("E601: Audio Preprocessing Error")
                .body(format!(
                    "FFMPEG RAN INTO AN ERROR WHILE PROCESSING {}",
                    track_name
                ))
                .show();
    }

    Ok(())
}
pub mod mutex_option_user_serde {
    use crate::User;
    use serde::{Deserialize, Deserializer, Serialize, Serializer};
    use tauri::async_runtime::Mutex;

    pub fn serialize<S>(value: &Mutex<Option<User>>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // Lock the mutex and serialize the inner value
        let user = value.blocking_lock();
        user.serialize(serializer)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Mutex<Option<User>>, D::Error>
    where
        D: Deserializer<'de>,
    {
        // Deserialize the inner value and wrap it in a Mutex
        let user = Option::<User>::deserialize(deserializer)?;
        Ok(Mutex::new(user))
    }
}
pub mod arc_rwlock_serde {
    use super::*;
    use std::sync::{Arc, RwLock};

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

pub async fn retrieve_code(
    window: tauri::Window,
    auth_url: String,
) -> Result<(String, String), MyError> {
    // Start the TCP server and get the receiver for the OAuth2 code
    // let (sender, mut receiver) = channel(100);
    window.shell().open(&auth_url, None).map_err(|e| MyError::Custom(e.to_string()))?;

    let listener = TcpListener::bind("127.0.0.1:1420").expect("Failed to bind port 1420");
    for stream in listener.incoming() {
        let stream = stream.expect("Failed to accept connection");
        let mut buffer = [0; 1024];
        stream
            .peek(&mut buffer)
            .expect("Failed to read from stream");

        // Simple HTTP parser to extract query parameters
        let request = String::from_utf8_lossy(&buffer);
        eprintln!("Incomming stream : {}", request);

        if request.starts_with("GET /") {
            let parts: Vec<&str> = request.split_whitespace().collect();
            eprintln!("Patys stream : {:?}", parts);

            if parts.len() > 1 {
                let url = parts[1];
                let query: Vec<&str> = url.split('?').collect();
                if query.len() > 1 {
                    let params: Vec<&str> = query[1].split('&').collect();
                    let mut state = String::new();
                    let mut code = String::new();
                    for param in params {
                        let key_value: Vec<&str> = param.split('=').collect();
                        if key_value.len() == 2 {
                            match key_value[0] {
                                "state" => state = key_value[1].to_string(),
                                "code" => code = key_value[1].to_string(),
                                _ => {}
                            }
                        }
                    }
                    println!("Gotten code and state continue");
                    // let _ = sender.send((state, code)).await;
                    return Ok((state, code));
                }
            }
        }
    }
    // });

    Err(MyError::Custom("()".to_string()))
}

pub fn establish_connection() -> SqliteConnection {
    dotenvy::dotenv().ok();
    let database_url =
        std::env::var("DATABASE_URL").expect("failed to find the env variable DATABASE_URL");
    SqliteConnection::establish(&database_url).expect("Failed to establish db connection")
}
