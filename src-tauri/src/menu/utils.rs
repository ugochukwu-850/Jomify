use std::{fmt, fs::File, path::PathBuf, str::FromStr, sync::{Arc, Mutex, RwLock}, thread, time::Duration};

use serde::{de::{self, DeserializeOwned, MapAccess, Visitor}, ser::SerializeStruct, Deserialize, Deserializer, Serialize, Serializer};

use crate::{menu::{auth_structures::User, core_structures::HomeResponse}, AppState, JomoQueue};

use super::{errors::MyError, gear_structures::Artist};

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

pub fn wait_read_file(
    filepath: &PathBuf,
    round: Option<u32>,
    delay: Option<u32>,
    recurse_index: Option<u32>,
) -> Result<File, MyError> {
    // Read the file from memory
    let round = if let Some(round) = round { round } else { 3 };
    let delay = if let Some(delay) = delay { delay } else { 60 };
    let recurse_index = if let Some(i) = recurse_index {
        i
    } else {
0    };
    match File::open(filepath) {
        Ok(val) => return Ok(val),
        Err(e) => {
            if recurse_index < round {
                let recurse_index = recurse_index.wrapping_add(1);

                // wait for the specified delay before continueing
                eprintln!(
                    "Error opening file: {:#?} \n - Waiting for {delay} seconds to try again on the next data \n Error -> {}",
                    filepath.to_str(),
                    e
                );
                thread::sleep(Duration::from_secs(delay as u64));
                return wait_read_file(filepath, Some(round), Some(delay), Some(recurse_index));
            }
            return Err(MyError::Custom(
                "Could not find even after several wait".to_string(),
            ));
        }
    };
}


#[test]
fn test_wait_file_read() {
    let mut path = PathBuf::new();
    path = path.join("mai.py");

    assert_eq!(wait_read_file(&path, Some(3), Some(10), None).is_err(), true);
}

pub mod arc_serde {
    use super::*;

    pub fn serialize<T, S>(data: &Arc<T>, serializer: S) -> Result<S::Ok, S::Error>
    where
        T: Serialize,
        S: Serializer,
    {
        T::serialize(&**data, serializer)
    }

    pub fn deserialize<'de, T, D>(deserializer: D) -> Result<Arc<T>, D::Error>
    where
        T: Deserialize<'de>,
        D: Deserializer<'de>,
    {
        T::deserialize(deserializer).map(Arc::new)
    }
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