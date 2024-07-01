use std::str::FromStr;

use serde::{Deserialize, Serialize};

use crate::menu::{auth_structures::User, core_structures::HomeResponse};

use super::{errors::MyError, gear_structures::Artist};

pub async fn get_user_with_db<T: Serialize>(db: &tauri::State<'_, sled::Db>, key: impl AsRef<[u8]>) -> Result<T, MyError> {
    if let Some(user) = db.get(key)? {
        serde_json::from_slice(&user)?;
    }
    Err(anyhow::anyhow!("Error there is no user in db"))?
}

pub fn generate_search_query(name: &String, artists_names: &Vec<String>) -> String {
    format!("{} by {}.mp3", name, artists_names.join(" , "))
}