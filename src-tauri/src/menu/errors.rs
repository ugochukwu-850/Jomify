use anyhow::Error as AnyhowError;
use chrono::ParseError as ChronoParseError;
use oauth2::http::Error as oauth2Error;
use reqwest::Error as ReqwestError;
use serde::ser::SerializeStruct;
use serde::{Serialize, Serializer};
use serde_json::Error as SerdeJsonError;
use sled::Error as SledError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum MyError {
    #[error("Request error: {0}")]
    Reqwest(#[from] ReqwestError),
    #[error("JSON error: {0}")]
    SerdeJson(#[from] SerdeJsonError),
    #[error("OAuth2 error: {0}")]
    OAuth2(#[from] oauth2Error),
    #[error("Database error: {0}")]
    Sled(#[from] SledError),
    #[error("Chrono parse error: {0}")]
    ChronoParse(#[from] ChronoParseError),
    #[error("Anyhow error: {0}")]
    Anyhow(#[from] AnyhowError),
    #[error("Error `{0}`")]
    Custom(String),
    #[error("UTF8 conversion error: {0}")]
    FromUtf8 (#[from] std::string::FromUtf8Error),
    #[error("Other error: {0}")]
    Other (#[from] Box<dyn std::error::Error + Send + Sync>),
}

impl Serialize for MyError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("MyError", 2)?;
        match self {
            MyError::Reqwest(e) => {
                state.serialize_field("type", "Reqwest")?;
                state.serialize_field("message", &e.to_string())?;
            }
            MyError::SerdeJson(e) => {
                state.serialize_field("type", "SerdeJson")?;
                state.serialize_field("message", &e.to_string())?;
            }
            MyError::OAuth2(e) => {
                state.serialize_field("type", "OAuth2")?;
                state.serialize_field("message", &e.to_string())?;
            }
            MyError::Sled(e) => {
                state.serialize_field("type", "Sled")?;
                state.serialize_field("message", &e.to_string())?;
            }
            MyError::ChronoParse(e) => {
                state.serialize_field("type", "ChronoParse")?;
                state.serialize_field("message", &e.to_string())?;
            }
            MyError::Anyhow(e) => {
                state.serialize_field("type", "Anyhow")?;
                state.serialize_field("message", &e.to_string())?;
            }
            MyError::Custom(e) => {
                state.serialize_field("type", "Custom")?;
                state.serialize_field("message", &e.to_string())?;
            },
            MyError::FromUtf8(e) =>  {
                state.serialize_field("type", "ReqwestTokenResponse")?;
                state.serialize_field("message", &e.to_string())?;
            },
            MyError::Other(e)  =>  {
                state.serialize_field("type", "ReqwestTokenResponse")?;
                state.serialize_field("message", &e.to_string())?;
            },
        }
        state.end()
    }
}
