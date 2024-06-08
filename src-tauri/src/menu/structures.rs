use anyhow::{anyhow, Result};
use oauth2::Scope;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub enum SupportedApps {
    Spotify,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SupportedAppsEnpoints {
    pub authourizationUrl: String,
    pub tokenUrl: String,
    pub scopes: Vec<Scope>,
    pub redirectUrl: String,
    pub clientId: String,
}

impl SupportedApps {
    fn generate_endpoints(&self, client_id: Option<String>) -> SupportedAppsEnpoints {
        match self {
            Self::Spotify => SupportedAppsEnpoints {
                authourizationUrl: "https://accounts.spotify.com/authorize".to_string(),
                tokenUrl: "https://accounts.spotify.com/token".to_string(),
                scopes: vec![
                    "user-read-private".to_string(),
                    "user-read-email".to_string(),
                ]
                .into_iter()
                .map(|f| Scope::new(f))
                .collect(),
                redirectUrl: "http://localhost:1420/callback".to_string(),
                clientId: client_id.unwrap_or_else(|| {self.get_default_client_id()}),
            },
        }
    }

        pub fn from_name(name: String) -> Result<Self> {
            match name.as_str() {
                "spotify" => {
                    Ok(SupportedApps::Spotify)
                },
                _ => { Err(anyhow!("Unsopported app name - {}", name ))}
            }
        }

        pub fn endpoints(&self, client_id: Option<String>) -> SupportedAppsEnpoints {
            match self {
                Self::Spotify => {
                    SupportedApps::Spotify.generate_endpoints(client_id)
                },
              
            }
        }
        pub fn name(&self) -> String {
            match self {
                Self::Spotify => {
                    String::from("spotify")
                }
            }
        }

    fn get_default_client_id(&self) -> String {
        match self {
            Self::Spotify => {
                "6065e323864b49e19050d7d3d4b42ff1".to_string()
            }
        }
    }
}
