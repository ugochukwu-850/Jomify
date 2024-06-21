use crate::menu::{auth_structures::User, core_structures::HomeResponse};

use super::errors::MyError;

pub async fn get_user_with_db(db: &sled::Db) -> Result<User, MyError> {
    if let Some(user) = db.get("user")? {
        serde_json::from_slice(&user)?;
    }
    Err(anyhow::anyhow!("Error there is no user in db"))?
}
