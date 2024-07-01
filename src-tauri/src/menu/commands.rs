use std::fs::File;
use std::io::BufReader;
use std::path::PathBuf;
use std::process::Command;
use std::sync::{Arc, Mutex, RwLock};
use std::thread;
use std::time::Duration;

use crate::menu::auth_structures::{AuthCreds, MetaInfo};
use crate::menu::utils::generate_search_query;
use crate::{AppState, JomoQueue, QueTrack};

use super::auth_structures::{Settings, SupportedApps, User};
use super::core_structures::HomeResponse;
use super::errors::MyError;
use super::gear_structures::{CoreTrackDetail, FeaturedPlaylistRequest, Tracks};
use super::utils::get_user_with_db;

use anyhow::anyhow;
use oauth2::reqwest::async_http_client;
use oauth2::url::Url;
use oauth2::{AuthorizationCode, CsrfToken, PkceCodeChallenge, PkceCodeVerifier};
use rodio::{queue, Decoder, OutputStream, Sink, Source};
use rusty_ytdl::search::{SearchResult, YouTube};
use rusty_ytdl::{Video, VideoOptions, VideoQuality, VideoSearchOptions};
use serde_json::json;
use tauri::api::path::app_data_dir;
use tauri::{command, Window};

// Define the store state to hold the store
#[command]
pub async fn generate_auth_url(
    client_id: Option<String>,
    app_name: String,
    db: tauri::State<'_, sled::Db>,
) -> Result<Url, MyError> {
    let app = SupportedApps::from_name(app_name)?;

    let client = app.generate_basic_oauth_client(client_id)?;

    // Generate a PKCE challenge.
    let (pkce_challenge, pkce_verifier) = PkceCodeChallenge::new_random_sha256();

    // Generate the full authorization URL.
    let (auth_url, csrf_token) = client
        .authorize_url(CsrfToken::new_random)
        // Set the desired scopes.
        .add_scopes(app.scopes())
        // Set the PKCE code challenge.
        .set_pkce_challenge(pkce_challenge)
        .url();

    // save the csrf token in state and also save the pcke verifier in state
    let _ = db.insert("verifier", pkce_verifier.secret().as_str())?;
    let _ = db.insert("csrf_token", csrf_token.secret().as_str())?;

    // save the client in state
    let _ = db.insert("auth_client_id", client.client_id().to_string().as_str())?;
    let _ = db.insert("app_name", app.name().as_str())?;

    Ok(auth_url)
}

#[command]
/// Async function command to exchange code for token for any client
pub async fn exchange_auth_code(
    state: Option<String>,
    code: String,
    db: tauri::State<'_, sled::Db>,
) -> Result<User, MyError> {
    // Async function actually run the exchange - This function could later become a closure
    let db_state = get_user_with_db::<String>(&db, "csrf_token").await?;
    let verifier = get_user_with_db::<String>(&db, "verifier").await?;
    let client_id = Some(get_user_with_db::<String>(&db, "auth_client_id").await?);
    let app_name = get_user_with_db::<String>(&db, "app_name").await?;

    if let Some(e) = state {
        if e != db_state {
            return Err(anyhow::anyhow!("State does not match"))?;
        }
    }
    let app = SupportedApps::from_name(app_name)?;

    let client = app.generate_basic_oauth_client(client_id.to_owned())?;

    let token_result = client
        .exchange_code(AuthorizationCode::new(code))
        .set_pkce_verifier(PkceCodeVerifier::new(verifier))
        .request_async(async_http_client)
        .await;
    match token_result {
        Ok(token) => {
            let token: AuthCreds = token.into();
            eprintln!("Got token | Expires in => {:?}", token.expires_at);
            let _ = db.insert(app.app_auth_key(), &*serde_json::to_string(&token)?)?;
            let profile = app.profile(&token.access_token).await?;
            let meta = MetaInfo {
                client_id: client_id.unwrap_or_else(|| app.get_default_client_id()),
            };
            let user = User {
                app,
                settings: Settings::new_default(),
                profile,
                meta,
            };
            // insert user into db
            let _ = db.insert("user", &*serde_json::to_string(&user)?)?;
            Ok(user)
        }
        Err(err) => Err(anyhow::anyhow!(err))?,
    }
}

#[command]
/// This function checks if the current user is authenticated
/// It does this by checking if there are access creds and if true returns True
/// If access_creds are expired it trys to refresh using the refresh token
/// If the refresh_token or refresh process fails then it returns false
/// NB: If no access creds it returns ```false```
pub async fn is_authenticated(
    db: tauri::State<'_, sled::Db>,
    app_state: tauri::State<'_, AppState>,
) -> Result<bool, MyError> {
    if let Some(user) = db.get("user")? {
        let user: User = serde_json::from_slice(&user)?;
        println!("Found user =|>|: {:?} \n", user.profile.display_name);
        let res = user.is_authenticated(db).await?;
        let mut app_state = app_state
            .user
            .lock()
            .map_err(|_| MyError::Custom("Error unlocking state".to_string()))?;
        *app_state = Some(user.clone());
        return Ok(res);
    }
    Err(anyhow!("Error there is no user in db"))?
}

#[command]
pub async fn home(
    db: tauri::State<'_, sled::Db>,
    app_state: tauri::State<'_, AppState>,
) -> Result<HomeResponse, MyError> {
    let var_name = Err(MyError::Custom("Failed to get user from lock".to_string()));
    let user = match app_state.user.lock() {
        Ok(e) => e.clone(),
        Err(e) => return var_name,
    };
    if let Some(user) = user {
        return user.home(db).await;
    }

    Err(anyhow::anyhow!("Error"))?
}
#[command]
pub async fn get_tracks(
    object: String,
    id: String,
    db: tauri::State<'_, sled::Db>,
    app_state: tauri::State<'_, AppState>,
) -> Result<Vec<CoreTrackDetail>, MyError> {
    let user = app_state
        .user
        .lock()
        .unwrap()
        .clone();
    if let Some(user) = user {
        return user.get_tracks(id, object, db).await;
    }

    Err(anyhow::anyhow!("Error"))?
}

pub async fn process_queue(
    config: &tauri::Config,
    tracks: Vec<QueTrack>,
    window: Window,
) -> Result<(), MyError> {
    let root_path = app_data_dir(config).expect("Failing to get app data dir");
    // Create the directory if it doesn't exist

    let audio_root_path = root_path.join("media").join("audio");
    let video_root_path = root_path.join("media").join("video");

    if !video_root_path.exists() {
        println!("Creating the video root path");
        std::fs::create_dir_all(&video_root_path).expect("Failed to create app data directory");
    }
    if !audio_root_path.exists() {
        println!("Creating the audio root path");
        std::fs::create_dir_all(&audio_root_path).expect("Failed to create app data directory");
    }
    let yt = YouTube::new().unwrap();

    // explicitely unlock queue as processing may stop it from being accessible

    'mainloop: for track in tracks {
        // get the query name
        let search_name = track.search_query();
        let video_path = video_root_path.join(format!("{}.mp4", search_name));
        let audio_path = audio_root_path.join(format!("{}.mp3", search_name));

        if audio_path.exists() || video_path.exists() {
            continue;
        }

        // run the search
        match yt.search(track.search_query(), None).await {
            Ok(search_result) => {
                let url = match (|| {
                    for result in search_result {
                        if let SearchResult::Video(video) = result {
                            println!(
                                "Search result video -> Id => {}, duration => {}, title => {}",
                                video.id, video.duration, video.title
                            );

                            if video.duration as usize <= track.duration_ms as usize + 30000
                                && video.duration as usize >= track.duration_ms as usize - 30000
                            {
                                println!("Found videos with similar length");
                                return Ok(video.url);
                            }
                        }
                    }
                    Err(())
                })() {
                    Ok(e) => {
                        println!("Video Sources => {e}");
                        e
                    }
                    Err(_) => {
                        eprintln!("An error occured we could not find the right video");
                        // emit message
                        continue 'mainloop;
                    }
                };

                let video_options = VideoOptions {
                    quality: VideoQuality::Highest,
                    filter: VideoSearchOptions::VideoAudio,
                    ..Default::default()
                };

                let video = Video::new_with_options(url, video_options)
                    .expect("Failed to find and download video");

                let stream = video.stream().await.unwrap();
                let mut total_bytes = Vec::new();

                while let Some(chunk) = stream.chunk().await.unwrap() {
                    // emit message of id of song and its byte downloaded
                    eprintln!("{} byte downloaded", chunk.len() / 1000);

                    total_bytes.extend(chunk);
                }

                _ = std::fs::write(&video_path, total_bytes).expect("Failed to save video");
                let status = Command::new("ffmpeg")
                    .arg("-i")
                    .arg(&video_path)
                    .arg("-vn") // Skip the video part
                    .arg("-acodec")
                    .arg("libmp3lame") // Encode audio to MP3 format
                    .arg(&audio_path)
                    .status()
                    .expect("Failed to execute ffmpeg command");
                if status.success() {
                    // set the queue items audio and video source
                    let _ = window.emit(
                        "downloaded",
                        format!("Sucessfully Downloaded {}", track.name),
                    );
                    eprintln!(
                        "Successfully processed this song {} saved at {:?}",
                        track.name,
                        audio_path.to_str()
                    )
                } else {
                    // emit message processing with ffmpeg did not go so well
                    continue;
                }
            }
            Err(_) => {
                // emit error
                continue;
            }
        };
    }

    Ok(())
}

pub fn play_queue(
    queue: Arc<RwLock<JomoQueue>>,
    root_path: Arc<PathBuf>,
    window: Window,
) -> Result<(), MyError> {
    let mut loop_i = 0;
    let (_stream, stream_handle) = OutputStream::try_default().expect("Failed to find default");
    let sink = Arc::new(Sink::try_new(&stream_handle).expect("Failed to load sink "));
    // start a loop on play
    let sink2 = sink.clone();
    let window1 = window.clone();
    window.listen("toggle-play", move |_| {
        if sink2.is_paused() {
            sink2.play();
        } else {
            sink2.pause()
        }
        window1
            .emit(
                "sink-playing-status",
                json!({"playing": !sink2.is_paused()}).to_string(),
            )
            .expect("Failed to run event");
        println!("Just toggled sink status => Playing {}", sink2.is_paused())
    });
    let sink3 = sink.clone();
    window.listen("set-volume", move |event| {
        let payload = if let Some(e) = event.payload() {
            e
        } else {
            return;
        };
        let position = payload.parse::<f32>().unwrap_or(1.0);
        sink3.set_volume(position);
    });
    let sink4 = sink.clone();
    window.listen("seek", move |event| {
        let payload = if let Some(e) = event.payload() {
            e
        } else {
            return;
        };
        let seconds = payload.parse::<f32>().unwrap_or(1.0);
        let _ = sink4.try_seek(Duration::from_secs_f32(seconds));
    });
    let next_sink = sink.clone();
    let next_queue = queue.clone();
    window.listen("next-previous", move |event| {
        let current_head = next_queue.read().expect("Failed to read next").head;
        if event.payload().is_some() {
            if let Some(head) = current_head {
                let len = next_queue.read().expect("read failed").que_track.len() as u32;
                next_queue.write().expect("Failed to write").head =
                    Some(head.wrapping_add(1) % len);
                next_sink.stop();
            }
        } else {
            if let Some(head) = current_head {
                let len = next_queue.read().expect("read failed").que_track.len() as u32;
                next_queue.write().expect("Failed to write").head =
                    Some((head.wrapping_sub(1)) % len); // Use wrapping_sub to avoid negative values
                next_sink.stop();
            }
        }
        println!(
            "Just toggled sink status => Playing {}",
            next_sink.is_paused()
        );
    });

    let stop_sink = sink.clone();
    window.listen("stop-sink", move |_| {
        stop_sink.stop();
    });

    loop {
        // Only if sink is playing should you try to play the next song
        if !sink.is_paused() {
            // Read the queue data
            let (
                head,
                que_track_len,
                QueTrack {
                    id,
                    name,
                    artists_names,
                    duration_ms,
                    audio_path,
                    video_path,
                    image_url,
                },
            ) = {
                let read_queue = match queue.read() {
                    Ok(q) => q,
                    Err(_) => {
                        // Emit error trying to lock queue
                        // If failed to read lock then continue
                        continue;
                    }
                };

                if read_queue.head.is_none() || read_queue.que_track.is_empty() {
                    // Skip if no valid track or queue is empty
                    continue;
                }

                let head = if let Some(e) = read_queue.head {
                    e
                } else {
                    continue;
                };
                let track = &read_queue.que_track[head as usize];
                (head, read_queue.que_track.len(), track.clone())
            };

            eprintln!("Loop index: {loop_i}");
            loop_i += 1;

            // Get the file path for the current head track
            let audio_root_path = root_path.join("media").join("audio");
            let audio_file_path =
                audio_root_path.join(generate_search_query(&name, &artists_names));

            // Read the file from memory
            let file = match File::open(&audio_file_path) {
                Ok(val) => val,
                Err(e) => {
                    eprintln!(
                        "Error opening file: {:#?} - Waiting for 180 seconds to try again on the next data Error -> {}",
                        audio_file_path.to_str(),
                        e
                    );
                    continue;
                }
            };

            let file = BufReader::new(file);

            // Attempt to decode the audio file and handle errors
            let source = match Decoder::new(file) {
                Ok(val) => val,
                Err(e) => {
                    eprintln!("Error decoding audio file: {}", e);
                    continue;
                }
            };

            // Stop the current sink
            sink.stop();

            // Append the new source file
            println!("Appending source to play it");
            let duration_ms = {
                if let Some(d) = source.total_duration() {
                    d.as_millis()
                } else {
                    duration_ms
                }
            };
            sink.append(source);

            // Play the file
            // emit the current-playing-changed
            let track = QueTrack {
                id,
                name,
                duration_ms,
                video_path,
                audio_path,
                artists_names,
                image_url,
            };
            window
                .emit(
                    "current-playing-changed",
                    serde_json::to_string(&track).expect("Failed to parse"),
                )
                .expect("Failed to emit message");

            sink.play();
            let _ = window.emit(
                "sink-playing-status",
                json!({"playing": !sink.is_paused()}).to_string(),
            );

            // Write the current head as a circular index
            let next_head = (head + 1) % que_track_len as u32;

            if let Ok(mut write_queue) = queue.write() {
                write_queue.head = Some(next_head);
            } else {
                eprintln!("Failed to acquire write lock to update head");
            }
            // Pause thread till done playing
            sink.sleep_until_end();
        }
        thread::sleep(Duration::from_secs(1));
    }
}

#[command]
pub fn add_to_queue(
    tracks: Vec<QueTrack>,
    add: bool,
    app_state: tauri::State<'_, AppState>,
    window: Window,
) -> Result<String, MyError> {
    // loop through every track and if just one track then its an add to queue option except else it a set queue option
    // set the queue object and call process queue and return
    println!("Running the add to queue command");
    match app_state.queue.write() {
        Ok(mut queue) => {
            println!("Running the locked data ");
            // if its a playlist play action
            if !add {
                window.trigger(
                    "process-tracks",
                    Some(serde_json::to_string(&tracks).expect("Could not parse queue")),
                );
                window.trigger(
                    "stop-sink",
                    Some(serde_json::to_string(&tracks).expect("Could not parse queue")),
                );
                queue.que_track = tracks;
                queue.head = Some(0);
                // emit process queue as queue has be updated\
            } else {
                window.trigger(
                    "process-tracks",
                    Some(serde_json::to_string(&tracks).expect("Could not parse queue")),
                );
                if queue.head.is_none() {
                    queue.head = Some(0)
                }
                queue.que_track.extend(tracks);
                // emit queue has been updated
            }
        }
        Err(err) => {
            eprintln!("{err:?}");
            println!("Adiedhueid ");
        }
    };

    println!(
        "App queue data => {:?}",
        app_state
            .queue
            .read()
            .expect("failed to read")
            .que_track
            .len()
    );

    Ok(String::new())
}
