use crate::menu::structures::{AuthCreds, MetaInfo};

use super::errors::MyError;
use super::structures::{Settings, SupportedApps, User};

use anyhow::anyhow;
use oauth2::reqwest::async_http_client;
use oauth2::url::Url;
use oauth2::{AuthorizationCode, CsrfToken, PkceCodeChallenge, PkceCodeVerifier};
use tauri::command;

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
    let db_state = db.get("csrf_token")?;
    let verifier = db.get("verifier")?;
    let auth_client_id = db.get("auth_client_id")?;
    let auth_app_name = db.get("app_name")?;

    if db_state.is_none()
        || verifier.is_none()
        || auth_client_id.is_none()
        || auth_app_name.is_none()
    {
        return Err(anyhow::anyhow!("Database data was not found").into());
    }

    let db_state = String::from_utf8(db_state.unwrap().to_vec())?;
    let verifier = String::from_utf8(verifier.unwrap().to_vec())?;
    let client_id = Some(String::from_utf8(auth_client_id.unwrap().to_vec())?);
    let app_name = String::from_utf8(auth_app_name.unwrap().to_vec())?;

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
            eprintln!("{token:?}");
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
pub async fn is_authenticated(db: tauri::State<'_, sled::Db>) -> Result<bool, MyError> {
    if let Some(user) = db.get("user")? {
        let user: User = serde_json::from_slice(&user)?;
        println!("User: {user:?} \n");
        return Ok(user.is_authenticated(db).await?);
    }
    Err(anyhow!("Error there is no user in db"))?
}
