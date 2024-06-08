use reqwest;
use serde::{Deserialize, Serialize};
use serde_json::Error;
use std::io;
use std::num::ParseIntError;
use thiserror::Error;

#[derive(Error, Debug, Deserialize, Serialize)]
pub enum MyError {
    
    #[error("Custom error: {0}")]
    Custom(String)
}
