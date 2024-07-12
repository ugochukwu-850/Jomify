use std::collections::HashSet;
use std::io::BufReader;
use std::path::PathBuf;
use std::sync::{Arc, Mutex, RwLock};
use std::thread;
use std::time::Duration;

use crate::menu::auth_structures::{AuthCreds, MetaInfo};
use crate::menu::utils::{generate_audio_path, wait_read_file};
use crate::{AppState, JomoQueue};

use super::auth_structures::{Settings, SupportedApps, User};
use super::core_structures::HomeResponse;
use super::errors::MyError;
use super::gear_structures::{AlbumItem, Artist, Track};
use super::utils::{retrieve_code, run_ffmpeg_command};

use anyhow::anyhow;
use oauth2::reqwest::async_http_client;
use oauth2::{AuthorizationCode, CsrfToken, PkceCodeChallenge, PkceCodeVerifier};
use rand::Rng;
use rodio::{Decoder, OutputStream, Sink};
use rusty_ytdl::search::{SearchResult, YouTube};
use rusty_ytdl::{Video, VideoOptions, VideoQuality, VideoSearchOptions};
use serde_json::json;
use tauri::api::notification::Notification;
use tauri::{command, Manager, Window};

// Define the store state to hold the store
#[command]
pub async fn sign_in(
    client_id: Option<String>,
    app_name: String,
    window: Window,
    app_state: tauri::State<'_, AppState>,
) -> Result<String, MyError> {
    println!("Gotten request to sign in");
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
    // let _ = db.insert("verifier", serde_json::to_vec(&pkce_verifier.secret())?)?;
    // let _ = db.insert("csrf_token", serde_json::to_vec(&csrf_token.secret())?)?;

    // // save the client in state
    // let _ = db.insert(
    //     "auth_client_id",
    //     serde_json::to_vec(&client.client_id().to_string())?,
    // )?;
    // let _ = db.insert("app_name", serde_json::to_vec(&app.name())?)?;

    // start the listner
    println!("Generated authorization url and started waiting for reciever");
    let (state, code) = retrieve_code(window.clone(), auth_url.to_string()).await?;
    println!("Generated the code and state");
    // exchange the code and state
    let user = exchange_auth_code(
        state,
        code,
        pkce_verifier,
        client.client_id().to_string(),
        app,
        csrf_token.secret().to_string(),
        app_state,
    )
    .await?;

    // before returning emit message loggedIn
    let _ = window.emit("authentication", "loggedIn");
    println!("Emitted logged In message and is returning");
    Ok(user.profile.merchant_id)
}

/// Async function command to exchange code for token for any client
pub async fn exchange_auth_code(
    state: String,
    code: String,
    verifier: PkceCodeVerifier,
    client_id: String,
    app: SupportedApps,
    csrf: String,
    app_state: tauri::State<'_, AppState>,
) -> Result<User, MyError> {
    // Async function actually run the exchange - This function could later become a closure

    println!(
        "Parsed all the key information state -> {}  client id -> {} app_name -> {}",
        csrf,
        client_id,
        app.name()
    );

    if state != csrf {
        return Err(anyhow::anyhow!("State does not match"))?;
    }

    // let app = SupportedApps::from_name(app_name)?;

    let client = app.generate_basic_oauth_client(Some(client_id.to_owned()))?;

    let token_result = client
        .exchange_code(AuthorizationCode::new(code))
        .set_pkce_verifier(verifier)
        .request_async(async_http_client)
        .await;
    match token_result {
        Ok(token) => {
            let auth_creds: AuthCreds = token.into();
            eprintln!("Got token | Expires in => {:?}", auth_creds.expires_at);
            let profile = app.profile(&auth_creds.access_token).await?;
            let meta = MetaInfo { client_id };
            let user = User {
                app,
                settings: Settings::new_default(),
                profile,
                meta,
                auth_creds,
            };
            // insert db into state : NB: would be saved to memory on exit
            app_state
                .user
                .lock()
                .expect("Failed to lock user")
                .replace(user.clone());

            // save the user authentication data into database
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
pub async fn is_authenticated(app_state: tauri::State<'_, AppState>) -> Result<bool, MyError> {
    let user = app_state.user.lock().expect("Failed to lock user").clone();
    if let Some(mut user) = user {
        println!("Found user =|>|: {:?} \n", user.profile.display_name);
        let res = user.is_authenticated().await?;
        return Ok(res);
    }
    Err(anyhow!("Error there is no user in db"))?
}

#[command]
pub async fn home(app_state: tauri::State<'_, AppState>) -> Result<HomeResponse, MyError> {
    let var_name = Err(MyError::Custom("Failed to get user from lock".to_string()));
    let user = match app_state.user.lock() {
        Ok(e) => e.clone(),
        Err(_) => return var_name,
    };
    if let Some(mut user) = user {
        let home = user.home().await;
        return home;
    };

    Err(anyhow::anyhow!("Error"))?
}
#[command]
pub async fn get_tracks(
    object: String,
    id: String,
    app_state: tauri::State<'_, AppState>,
) -> Result<Vec<Track>, MyError> {
    let user = app_state.user.lock().unwrap().clone();
    if let Some(mut user) = user {
        return user.get_tracks(id, object).await;
    }

    Err(anyhow::anyhow!("Error"))?
}

pub async fn process_queue(
    root_path: Arc<PathBuf>,
    tracks: Vec<Track>,
    window: Window,
    processes_queue: Arc<RwLock<HashSet<String>>>,
) -> Result<(), MyError> {
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
        // check if this track is in the process_queue
        if processes_queue
            .read()
            .expect("Faioled to read process here")
            .contains(&track.id)
        {
            println!("Someone is already processing this :{}", track.id);
            continue;
        }
        // get the query name
        let video_path = video_root_path.join(track.video_path());
        let audio_path = audio_root_path.join(track.audio_path());

        if audio_path.exists() && video_path.exists() {
            println!("Found song {:?}", audio_path.to_str());
            continue;
        } else {
            println!("Did not find song {:?} path", audio_path.to_str());
        }

        // set that you are now processing this track
        {
            processes_queue
                .write()
                .expect("Failed to lock")
                .insert(track.id.clone());
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

                            if video.duration as usize <= track.duration_ms as usize + 10000
                                && video.duration as usize >= track.duration_ms as usize - 10000
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
                        // emit message could not find video
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

                while let Some(chunk) = if let Ok(e) = stream.chunk().await {
                    e
                } else {
                    let _ = Notification::new(&window.config().tauri.bundle.identifier)
                        .title("D603: Download Error")
                        .body(format!("Could not complete downloading {}", track.name))
                        .show();
                    continue 'mainloop;
                } {
                    // emit message of id of song and its byte downloaded
                    eprintln!("{} byte downloaded", chunk.len() / 1000);

                    total_bytes.extend(chunk);
                }
                if total_bytes.is_empty() {
                    println!(
                        "Could not download track becuase no data in stream: {}",
                        track.name
                    );
                    continue;
                }
                _ = std::fs::write(&video_path, total_bytes).expect("Failed to save video");
                match run_ffmpeg_command(
                    window.clone(),
                    &track.id,
                    &track.name,
                    &track.search_query(),
                    &video_path,
                    &audio_path,
                )
                .await
                {
                    Ok(_) => {}
                    Err(_) => continue,
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
    sink.pause();
    let repeat = Arc::new(RwLock::new(false));
    let shuffle = Arc::new(RwLock::new(false));

    // toggle the play state
    let toggle_play = || {
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
    };

    let volume_control = || {
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
    };

    let seek_sink = || {
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
    };

    let play_index = || {
        let set_play_sink = sink.clone();
        let set_play_queue = queue.clone();
        window.listen("set-play", move |event| {
            if let Some(payload) = event.payload().and_then(|e| e.parse::<u32>().ok()) {
                let mut write_guard = set_play_queue.write().expect("Failed to write");
                write_guard.head = Some(payload); // Use wrapping_sub to avoid negative values
                drop(write_guard); // Release the write lock before calling stop
                set_play_sink.stop();
            }
        });
    };

    let next_and_previous = || {
        let next_sink = sink.clone();
        let next_queue = queue.clone();
        window.listen("next-previous", move |event| {
            let current_head = next_queue.read().expect("Failed to read next").head;
            if event.payload().is_some() {
                if let Some(head) = current_head {
                    let len = next_queue.read().expect("read failed").que_track.len() as u32;
                    let mut write_lock = next_queue.write().expect("Failed to write");
                    write_lock.head = Some(head.wrapping_add(1) % len);
                    next_sink.stop();
                }
            } else {
                if let Some(head) = current_head {
                    let len = next_queue.read().expect("read failed").que_track.len() as u32;
                    let mut write_lock = next_queue.write().expect("Failed to write");
                    // because ones the sink is stoped it automatically updates the head by one ; Make the countback twice
                    write_lock.head = Some((head.wrapping_sub(1)) % len); // Use wrapping_sub to avoid negative values
                    next_sink.stop();
                }
            }
            println!(
                "Just toggled sink status => Playing {}",
                next_sink.is_paused()
            );
            next_sink.play();
        });
    };

    let stop_sink = || {
        // stop sink command
        let stop_sink = sink.clone();
        window.listen("stop-sink", move |_| {
            stop_sink.stop();
        });
    };

    let toggle_repeat = || {
        let repeat_clone = repeat.clone();
        window.listen("toggle-repeat", move |_| {
            let repeat = repeat_clone
                .read()
                .expect("Failed to read the repeat")
                .clone();
            *repeat_clone.write().expect("Failed to write lock repeat") = !repeat;
        });
    };

    let toggle_shuffle = || {
        let shuffle_clone = shuffle.clone();
        window.listen("toggle-shuffle", move |_| {
            let shuffle = shuffle_clone
                .read()
                .expect("Failed to read the repeat")
                .clone();
            *shuffle_clone.write().expect("Failed to write lock repeat") = !shuffle;
        });
    };

    let handle_position = || {
        let sink = sink.clone();
        let position = Arc::new(Mutex::new(0));
        let r_pos = position.clone();
        let window = window.clone();

        window.listen("current-playing-changed", move |_| {
            *r_pos.lock().expect("Failed to lock") = 0;
        });

        // Start main loop
        '_main_loop: {
            if !sink.is_paused() {
                let mut position_guard = position.lock().expect("Failed to lock");
                *position_guard += 1;
                let _ = window.emit("sink-position", *position_guard);
                thread::sleep(Duration::from_secs_f32(0.9999))
            }
        }
    };

    // Event handler: toggle play
    toggle_play();

    // Event handler: control volume
    volume_control();

    // Event handler: set seek
    seek_sink();

    // Event handler: Plays a particular track at index {}
    play_index();

    // Event handler: Handles next and previous functions
    next_and_previous();

    // Event handler: causes the sink to stop
    stop_sink();

    // Event handler: Toggles repeat

    toggle_repeat();

    //Event handler: toggles queue playback shuffle state
    toggle_shuffle();

    // Handles the state of the current queue position
    handle_position();

    '_player_loop: loop {
        // Only if sink is playing should you try to play the next song
        if !sink.is_paused() && queue.read().expect("Failed to read").que_track.len() > 0 {
            // Read the queue data
            let Track {
                album,
                artists,
                name,
                id,
                duration_ms,
                href,
                popularity,
                object_type,
            } = {
                let read_queue = match queue.read() {
                    Ok(q) => {
                        println!(
                            "This is what is in the queue now length: {:?}",
                            q.que_track.len()
                        );
                        q
                    }
                    Err(_) => {
                        // Emit error trying to lock queue
                        // If failed to read lock then continue
                        continue;
                    }
                };

                if read_queue.que_track.is_empty() {
                    // Skip if no valid track or queue is empty
                    continue;
                }

                let head = if let Some(e) = read_queue.head {
                    e
                } else {
                    continue;
                };
                let track = &read_queue.que_track[head as usize];
                track.clone()
            };

            eprintln!("Loop index: {loop_i}");
            loop_i += 1;

            // Get the file path for the current head track
            let audio_root_path = root_path.join("media").join("audio");
            let audio_file_path = audio_root_path.join(generate_audio_path(
                &name,
                &artists.iter().map(|f| f.name.to_owned()).collect(),
            ));
            let before_wait_head = queue.read().expect("Failed to read").head.clone().unwrap();
            let mut file = None;
            // emit the current-playing-changed
            let track = Track {
                album,
                artists,
                name,
                id,
                duration_ms,
                href,
                popularity,
                object_type,
            };

            // start playing track

            // Scope the read lock to minimize its duration
            let (cur_head, read_queue_len) = {
                let read_queue = queue.read().expect("Failed to read");
                let len = read_queue.que_track.len();
                let head = read_queue.head.clone().unwrap();
                (head, len)
            };

            // only if this is not the last item
            if cur_head as usize % read_queue_len != read_queue_len - 1 {
                let read_queue = queue.read().expect("Failed to read");
                let next_track =
                    &read_queue.que_track[cur_head as usize % read_queue_len as usize..][..2];

                if let Ok(e) = serde_json::to_string(next_track) {
                    // Attempting to process next track
                    println!("Attempting to process next track: {}", e);
                    window.trigger("process-tracks", Some(e));
                }
            }

            window
                .emit(
                    "current-playing-changed",
                    serde_json::to_string(&track).expect("Failed to parse"),
                )
                .expect("Failed to emit message");

            let _ = window.emit(
                "sink-playing-status",
                json!({"playing": !sink.is_paused()}).to_string(),
            );
            'recurse_get_file: for x in 0..20 {
                // if the queue has changed or the file is found break out of loop
                if queue.read().expect("Head failed to wait").head.unwrap() != before_wait_head
                    || file.is_some()
                {
                    thread::sleep(Duration::from_secs(2));
                    break 'recurse_get_file;
                }
                // try to get the file
                file = if let Ok(e) = wait_read_file(&audio_file_path) {
                    Some(e)
                } else {
                    // if not file just continue
                    continue 'recurse_get_file;
                };
                println!("Attempting find retry: {}", x);
            }

            // if a file was found do the normal processing other wise just go to the next
            if let Some(file) = file {
                let file = BufReader::new(file);

                // Attempt to decode the audio file and handle errors
                let source = match Decoder::new(file) {
                    Ok(val) => val,
                    Err(e) => {
                        eprintln!("Error decoding audio file: {}", e);
                        continue;
                    }
                };
                // stop the current sink or empty it
                sink.stop();
                // Append the new source file
                println!("Appending source to play it");
                sink.append(source);

                // emit that the current playing is now not loading
                let _ = window.emit("loading", "false");

                sink.play();

                sink.sleep_until_end();
            }

            let cur_head = queue.read().expect("Failed to read").head.clone().unwrap();
            if cur_head == before_wait_head {
                if *repeat.read().expect("Failed to read repeat") {
                    continue;
                }
                let cur_queue = queue.read().expect("Failed to read").clone();

                let index = if *shuffle.read().expect("Failed to read") {
                   let mut rng = rand::thread_rng();
                   rng.gen_range(0..cur_queue.que_track.len()-1)
                } else {
                    cur_queue.head.unwrap().wrapping_add(1) as usize % cur_queue.que_track.len()
                };
                queue.write().expect("Failed to write").head = Some(index as u32);
            }
        }
    }
}

#[command]
pub fn add_to_queue(
    play: bool,
    tracks: Vec<Track>,
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
                // window.trigger(
                //     "process-tracks",
                //     Some(serde_json::to_string(&tracks).expect("Could not parse queue")),
                // );

                queue.que_track = tracks.clone();
                queue.head = Some(0);
                window.trigger("stop-sink", None);
                // emit process queue as queue has be updated\
            } else {
                // window.trigger(
                //     "process-tracks",
                //     Some(serde_json::to_string(&tracks).expect("Could not parse queue")),
                // );

                // All tracks not in quetrack
                let cleaned_tracks: Vec<Track> = tracks
                    .iter()
                    .filter_map(|f| {
                        // if track is not in queue return it
                        if queue.que_track.iter().find(|e| e.id == f.id).is_some() {
                            None
                        } else {
                            Some(f.clone())
                        }
                    })
                    .collect();
                //Extend the play list

                if queue.head.is_none() {
                    queue.head = Some(0)
                }
                println!("{cleaned_tracks:?}");
                // extend the queue
                queue.que_track.extend(cleaned_tracks.clone());
                // emit stop to start playing if play
                if play && queue.que_track.len() > 0 {
                    // get the index of the first track in the main queue
                    let indy_index = queue.que_track.iter().enumerate().find_map(|(index, f)| {
                        if tracks.len() > 0 && f.id == tracks[0].id {
                            Some(index)
                        } else {
                            None
                        }
                    });
                    let i = if let Some(e) = indy_index {
                        e
                    } else {
                        queue.que_track.len().wrapping_sub(1)
                    };
                    println!(
                        "New queue index: {i} Queue.lenght: {}",
                        queue.que_track.len()
                    );
                    queue.head = Some((i % queue.que_track.len()).try_into().unwrap());
                    window.trigger("stop-sink", None);
                }
            }
        }
        Err(err) => {
            eprintln!("{err:?}");
            println!("Adiedhueid ");
        }
    };
    let res_queue = app_state
        .queue
        .read()
        .expect("failed to read")
        .que_track
        .clone();
    let _ = window.emit("queue-changed", serde_json::to_string(&res_queue)?);
    println!("App queue data => {:?}", res_queue.len());

    Ok(String::new())
}

#[command]
pub async fn remove_from_playlist(
    window: Window,
    app_state: tauri::State<'_, AppState>,
    index: usize,
) -> Result<String, MyError> {
    let que_tracks = app_state
        .queue
        .read()
        .expect("Failed to read")
        .que_track
        .clone();
    if index >= que_tracks.len() {
        return Err(MyError::Custom(
            "Please the index is not in queue : invalid".to_string(),
        ));
    }
    app_state
        .queue
        .write()
        .expect("Failed to write")
        .que_track
        .remove(index);
    // because queue has changed emit event
    let que_tracks = app_state
        .queue
        .read()
        .expect("Failed to read")
        .que_track
        .clone();
    let _ = window.emit("queue-changed", serde_json::to_string(&que_tracks)?);
    Ok(String::from("It worked"))
}

#[command]
/// Calls the process track on all given tracks and returns
/// Used on any types that is a vector of Track
pub fn download(tracks: Vec<Track>, window: Window) -> Result<(), MyError> {
    // call the process tracks on it
    window.trigger("process-tracks", Some(serde_json::to_string(&tracks)?));
    println!("download has been called ");
    Ok(())
}

#[command]
/// Is download does not actually perform any download actions
/// Instead it checks if every track in the request data is in downloaded
/// it triggers and emits an event with the status of the track
pub fn is_downloaded(window: Window, tracks: Vec<Track>) {
    let root_dir = if let Some(e) = tauri::api::path::app_data_dir(&window.config()) {
        e.join("media")
    } else {
        return;
    };

    // use tauri to try to open their file path
    for track in tracks {
        let audio_path = root_dir.join("audio").join(track.audio_path());
        let video_path = root_dir.join("video").join(track.video_path());
        if audio_path.exists() || video_path.exists() {
            println!("This track is in downloads: {}", track.id);

            let _ = window.emit(&format!("downloaded-{}", track.id), "downloaded");
        } else {
            println!("NOT IN DOWNLOAD: {}", track.id);
        }
    }
}

#[command]
/// Get the current queue for render of the queue component
/// NB: Further queue update would be handled by events as this command is only used on initialization
pub fn get_queue(window: Window) -> Result<Vec<Track>, MyError> {
    let state = window.state::<AppState>();
    let queue_tracks = state
        .queue
        .read()
        .map_err(|_e| MyError::Custom(format!("Function get tracks: this lock is poisoned")))?
        .que_track
        .clone();
    Ok(queue_tracks)
}

#[command]
/// - Returns the current head track
/// ##### | Should be used to get current head track from the front end by player component
pub fn get_head(window: Window) -> Result<Track, MyError> {
    let state = window.state::<AppState>();
    let queue_tracks = state
        .queue
        .read()
        .map_err(|_e| MyError::Custom(format!("Function get tracks: this lock is poisoned")))?;
    if let Some(e) = queue_tracks.head {
        return Ok(queue_tracks.que_track[e as usize].clone());
    } else {
        return Err(MyError::Custom(format!("You dont have a head track")));
    }
}

#[command]
/// #### This function takes a track `Track` type
///
/// - It checks the current queue and if this track is not the next
/// - it adds it to the queue as the next track else it does nothing
/// - It does not immeaditely play the track though
/// - It also calls process tracks on this track so this track is always ready to play when needed
pub fn play_next(window: Window, track: Track) {
    let state = window.state::<AppState>();
    let mut queue = state.queue.write().expect("Failed to get lock");

    // add the track to the queue if it is not already the next
    let head = if let Some(e) = queue.head {
        e
    } else {
        return;
    };
    let queue_len = queue.que_track.len();

    // if the head is not the same as the requested next add it else do nothing
    let next_head_index = (head.wrapping_add(1) % queue_len as u32) as usize;
    let next_track = &queue.que_track[next_head_index];
    if next_track.id == track.id {
        return;
    }

    // else shift the current head to next and set the next to this track
    queue.head = Some(next_head_index as u32);
    let track_as_string = serde_json::to_string(&[&track]).unwrap();
    queue.que_track.insert(next_head_index, track);

    // call process track and emit queue has changed
    window.trigger("process-tracks", Some(track_as_string));
    let _ = window.emit(
        "queue-changed",
        serde_json::to_string(&queue.que_track).expect("Failed to parse"),
    );
}

/// Command to retrive artist full data
/// This commands returns a list of albums
#[command]
pub async fn artist_detail(id: String, window: Window) -> Result<Artist, MyError> {
    let var_name = Err(MyError::Custom("Failed to get user from lock".to_string()));
    let user = match window.state::<AppState>().user.lock() {
        Ok(e) => e.clone(),
        Err(_) => return var_name,
    };
    if let Some(mut user) = user {
        let home = user.get_artist(id).await;
        return home;
    };

    Err(anyhow::anyhow!(
        "Error could not find the user and therefore could not get artist cause error occuredd"
    ))?
}

#[command]
pub async fn artist_albums(id: String, window: Window) -> Result<Vec<AlbumItem>, MyError> {
    let var_name = Err(MyError::Custom("Failed to get user from lock".to_string()));
    let user = match window.state::<AppState>().user.lock() {
        Ok(e) => e.clone(),
        Err(_) => return var_name,
    };
    if let Some(mut user) = user {
        let home = user.get_artist_albums(id).await;
        return home;
    };

    Err(anyhow::anyhow!(
        "Error could not find the user and therefore could not get artist cause error occuredd"
    ))?
}

#[command]
pub async fn search_command(
    q: String,
    window: Window,
) -> Result<super::gear_structures::SearchResult, MyError> {
    let var_name = Err(MyError::Custom("Failed to get user from lock".to_string()));
    let user = match window.state::<AppState>().user.lock() {
        Ok(e) => e.clone(),
        Err(_) => return var_name,
    };
    if let Some(mut user) = user {
        let home = user.search(q).await;
        return home;
    };

    Err(anyhow::anyhow!(
        "Error could not find the user and therefore could not get artist cause error occuredd"
    ))?
}
