use std::{
    
    fs::File,
    net::TcpListener,
    path::PathBuf,
    time::{ SystemTime, UNIX_EPOCH},
};

use serde::{
    // de::DeserializeOwned,
    de::DeserializeOwned, Deserialize, Deserializer, Serialize, Serializer
};


use super::errors::MyError;

pub fn get_data_from_db<T: DeserializeOwned + Serialize>(
    db: &tauri::State<'_, sled::Db>,
    key: impl AsRef<[u8]>,
) -> Result<T, MyError> {
    if let Some(user) = db.get(key)? {
        let user: T = serde_json::from_slice(&user)?;
        return Ok(user);
    }
    else {
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

use tauri::{
    api::{
        process::{Command, CommandEvent},
        shell::open,
    },
    Manager,
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
    open(&window.shell_scope(), &auth_url, None).map_err(|e| MyError::Custom(e.to_string()))?;

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
