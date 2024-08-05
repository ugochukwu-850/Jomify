use std::collections::HashMap;

use chrono::Utc;
use oauth2::{
    basic::BasicClient, AuthUrl, ClientId, ExtraTokenFields, RedirectUrl, Scope,
    StandardTokenResponse, TokenResponse, TokenType, TokenUrl,
};

use serde::{Deserialize, Serialize};

use super::errors::MyError;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum SupportedApps {
    Spotify,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[allow(unused_variables)]
pub struct SupportedAppsEnpoints {
    authourization_url: String,
    token_url: String,
    redirect_url: String,
    client_id: String,
}
#[derive(Serialize, Debug, Deserialize, Clone)]
#[allow(unused_variables)]
pub struct UserProfileData {
    pub display_name: Option<String>,
    pub email: Option<String>,
    pub country: Option<String>,
    pub image_url: Vec<Image>,
    pub product: String,
    pub merchant_id: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SpotifyUser {
    country: Option<String>,
    display_name: Option<String>,
    email: Option<String>,
    images: Vec<Image>,
    product: String,
    id: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Image {
    pub url: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Equalizer;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MetaSettings {
    pub file_load_timeout: Option<u64>
}
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub equalizer: Equalizer,
    pub meta_settings: MetaSettings
}

#[derive(Debug, Serialize, Deserialize, Clone)]

pub struct AuthCreds {
    pub access_token: String,
    pub refresh_token: Option<String>,
    #[serde(alias = "expires_in")]
    pub expires_at: i64,
    pub token_type: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub app: SupportedApps,
    pub settings: Settings,
    pub profile: UserProfileData,
    pub meta: MetaInfo,
    pub auth_creds: AuthCreds,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MetaInfo {
    pub client_id: String,
}
impl User {
    pub async fn is_authenticated(&mut self) -> Result<bool, MyError> {
        match self.get_auth_creds().await {
            Ok(_) => Ok(true),
            Err(e) => Err(e),
        }
    }
    /// Gets the auth creds and refresh them if neccessary
    pub async fn get_auth_creds(
        &mut self,
    ) -> Result<AuthCreds, MyError> {
        match &mut self.app {
            SupportedApps::Spotify => {
                let auth_cred = self.refresh().await?;
                Ok(auth_cred)
            }
        }
    }

    async fn refresh(&mut self) -> Result<AuthCreds, MyError> {
        let creds = &self.auth_creds;
        match self.app {
            SupportedApps::Spotify => {
                if creds.expires_at > chrono::Utc::now().timestamp() {
                    return Ok(creds.clone());
                }

                let client = reqwest::Client::new();
                let app = self
                    .app
                    .generate_endpoints(Some(self.meta.client_id.to_owned()));
                let token = creds.refresh_token.as_ref().unwrap();
                let client_id = &self.meta.client_id;
                let grant_type = &String::from("refresh_token");
                let params = HashMap::from([
                    ("refresh_token", token),
                    ("client_id", client_id),
                    ("grant_type", grant_type),
                ]);

                let res = client.post(app.token_url).form(&params).send().await;

                match res {
                    Ok(response) => {
                        if response.status().is_success() {
                            let response = response.text().await?;
                            let mut auth_creds: AuthCreds = serde_json::from_str(&response)?;
                            auth_creds.validate();
                            // update the user state to have the creds in it 
                            self.auth_creds = auth_creds.clone();
                            return Ok(auth_creds);
                        }

                        Err(MyError::Custom(format!(
                            "Refresh operation did not succeed: {:?} ",
                            &response.text().await
                        )))
                    }
                    Err(e) => Err(MyError::Custom(format!(
                        "An error occured while making the refresh request: {}",
                        e.to_string()
                    ))),
                }
            }
        }
    }
}

impl SupportedApps {
    pub fn app_auth_key(&self) -> String {
        match self {
            SupportedApps::Spotify => {
                format!("{}_auth_creds", self.name())
            }
        }
    }

    pub fn generate_basic_oauth_client(
        &self,
        client_id: Option<String>,
    ) -> anyhow::Result<BasicClient> {
        let app_endpoints = self.generate_endpoints(client_id);
        Ok(BasicClient::new(
            ClientId::new(app_endpoints.client_id.to_owned()),
            None,
            AuthUrl::new(app_endpoints.authourization_url)?,
            Some(TokenUrl::new(app_endpoints.token_url)?),
        )
        .set_redirect_uri(RedirectUrl::new(app_endpoints.redirect_url)?))
    }
    pub fn scopes(&self) -> Vec<Scope> {
        match self {
            Self::Spotify => vec![
                "user-read-private".to_string(),
                "user-read-email".to_string(),
            ]
            .into_iter()
            .map(|f| Scope::new(f))
            .collect(),
        }
    }
    fn generate_endpoints(&self, client_id: Option<String>) -> SupportedAppsEnpoints {
        match self {
            Self::Spotify => SupportedAppsEnpoints {
                authourization_url: "https://accounts.spotify.com/authorize".to_string(),
                token_url: "https://accounts.spotify.com/api/token".to_string(),
                redirect_url: "http://127.0.0.1:1420/".to_string(),
                client_id: client_id.unwrap_or_else(|| self.get_default_client_id()),
            },
        }
    }

    pub fn from_name(name: String) -> Result<SupportedApps, MyError> {
        match name.as_str() {
            "spotify" => Ok(SupportedApps::Spotify),
            _ => Err(MyError::Custom("Error Generating app from name".to_owned())),
        }
    }
    pub fn name(&self) -> String {
        match self {
            Self::Spotify => String::from("spotify"),
        }
    }

    pub async fn profile(&self, token: &String) -> Result<UserProfileData, MyError> {
        match self {
            SupportedApps::Spotify => {
                let client = reqwest::Client::new();
                let url = "https://api.spotify.com/v1/me";
                let response = client.get(url).bearer_auth(token).send().await?;
                if response.status().is_success() {
                    let user_profile = response.text().await?;
                    println!("{user_profile}");
                    let user_profile: SpotifyUser = serde_json::from_str(&user_profile)?;
                    Ok(user_profile.into())
                } else {
                    Err(anyhow::anyhow!(
                        "Error fetching the user : status - {}",
                        response.status()
                    )
                    .context(response.status()))?
                }
            }
        }
    }
    pub fn get_default_client_id(&self) -> String {
        match self {
            Self::Spotify => "6065e323864b49e19050d7d3d4b42ff1".to_string(),
        }
    }
}

impl Settings {
    pub fn new_default() -> Self {
        Self {
            meta_settings: MetaSettings::new_default(),
            equalizer: Equalizer::new_default(),
        }
    }
}

impl Equalizer {
    pub fn new_default() -> Self {
        Self
    }
}

impl MetaSettings {
    pub fn new_default() -> Self {
        Self {
            file_load_timeout: None,
        }
    }
}

impl From<SpotifyUser> for UserProfileData {
    fn from(value: SpotifyUser) -> Self {
        Self {
            display_name: value.display_name,
            email: value.email,
            country: value.country,
            image_url: value.images,
            product: value.product,
            merchant_id: value.id,
        }
    }
}

impl<EF, TT> From<StandardTokenResponse<EF, TT>> for AuthCreds
where
    EF: ExtraTokenFields,
    TT: TokenType + AsRef<str>,
{
    fn from(token_response: StandardTokenResponse<EF, TT>) -> Self {
        AuthCreds {
            access_token: token_response.access_token().secret().to_string(),
            token_type: token_response.token_type().as_ref().to_string(),
            expires_at: token_response
                .expires_in()
                .map(|seconds| Utc::now() + chrono::Duration::seconds(seconds.as_secs() as i64))
                .unwrap()
                .timestamp(),

            refresh_token: token_response.refresh_token().map(|t| t.secret().clone()),
        }
    }
}

impl AuthCreds {
    pub fn validate(&mut self) {
        if self.expires_at < chrono::Utc::now().timestamp() {
            self.expires_at += chrono::Utc::now().timestamp();
        }
    }
}
