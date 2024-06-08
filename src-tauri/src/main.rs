// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod menu;
use anyhow::anyhow;
use menu::errors::MyError;
use menu::structures::{SupportedApps, SupportedAppsEnpoints};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sled::Db;
use tauri::api::path::app_data_dir;
use tauri::{command, Manager};

use oauth2::basic::BasicClient;
use oauth2::reqwest::async_http_client;
use oauth2::url::Url;
use oauth2::{
    AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken, PkceCodeChallenge,
    PkceCodeVerifier, RedirectUrl, Scope, TokenResponse, TokenUrl,
};
use std::any;
use std::path::PathBuf;

// Define the store state to hold the store

#[command]
async fn generate_auth_url(
    client_id: Option<String>,
    app_name: String,
    db: tauri::State<'_, sled::Db>,
) -> Result<Url, MyError> {
    async fn run_generate_auth_url(
        app: SupportedApps,
        client_id: Option<String>,
        db: tauri::State<'_, sled::Db>,
    ) -> anyhow::Result<Url> {
        let app_endpoints = app.endpoints(client_id);

        let client = BasicClient::new(
            ClientId::new(app_endpoints.clientId.to_owned()),
            None,
            AuthUrl::new(app_endpoints.authourizationUrl)?,
            Some(TokenUrl::new(app_endpoints.tokenUrl)?),
        )
        // Set the URL the user will be redirected to after the authorization process.
        .set_redirect_uri(RedirectUrl::new(app_endpoints.redirectUrl)?);

        // Generate a PKCE challenge.
        let (pkce_challenge, pkce_verifier) = PkceCodeChallenge::new_random_sha256();

        // Generate the full authorization URL.
        let (auth_url, csrf_token) = client
            .authorize_url(CsrfToken::new_random)
            // Set the desired scopes.
            .add_scopes(app_endpoints.scopes)
            // Set the PKCE code challenge.
            .set_pkce_challenge(pkce_challenge)
            .url();
        // save the csrf token in state and also save the pcke verifier in state
        let _ = db.insert("verifier", pkce_verifier.secret().as_str())?;
        let _ = db.insert("csrf_token", csrf_token.secret().as_str())?;

        // save the client in state
        let _ = db.insert("auth_client_id", app_endpoints.clientId.as_str())?;
        let _ = db.insert("app_name", app.name().as_str())?;

        Ok(auth_url)
    }
    let app = if let Ok(e) = SupportedApps::from_name(app_name) {
        e
    } else {
        return Err(MyError::Custom("Database Error".to_string()));
    };
    match run_generate_auth_url(app, client_id, db).await {
        Ok(e) => Ok(e),
        Err(e) => Err(MyError::Custom(format!(
            "An error occured : {}",
            e.to_string()
        ))),
    }
}

#[command]
async fn exchange_auth_code(
    state: Option<String>,
    code: String,
    db: tauri::State<'_, sled::Db>,
) -> Result<(), MyError> {
    async fn run_exchange(
        state: Option<String>,
        code: String,
        db: tauri::State<'_, sled::Db>,
    ) -> anyhow::Result<()> {
        let db_state = db.get("csrf_token")?;
        let verifier = db.get("verifier")?;
        let auth_client_id = db.get("auth_client_id")?;
        let auth_app_name = db.get("app_name")?;

        if db_state.is_none()
            || verifier.is_none()
            || auth_client_id.is_none()
            || auth_app_name.is_none()
        {
            return Err(anyhow::anyhow!("Database data was not found"));
        }

        let db_state = String::from_utf8(db_state.unwrap().to_vec())?;
        let verifier = String::from_utf8(verifier.unwrap().to_vec())?;
        let client_id = Some(String::from_utf8(auth_client_id.unwrap().to_vec())?);
        let app_name = String::from_utf8(auth_app_name.unwrap().to_vec())?;

        if let Some(e) = state {
            if e != db_state {
                return Err(anyhow::anyhow!("State does not match"));
            }
        }

        println!("{}, {}, {:?}, {}", db_state, verifier, client_id, app_name);

        let app_endpoints = SupportedApps::from_name(app_name)?.endpoints(client_id);

        let client = BasicClient::new(
            ClientId::new(app_endpoints.clientId.to_owned()),
            None,
            AuthUrl::new(app_endpoints.authourizationUrl)?,
            Some(TokenUrl::new(app_endpoints.tokenUrl)?),
        );

        let token_result = client
            .exchange_code(AuthorizationCode::new(code))
            .set_pkce_verifier(PkceCodeVerifier::new(verifier))
            .request_async(async_http_client)
            .await;
        let token_result = match token_result {
            Ok(e) => e,
            Err(e) => {
                println!("{:?}", e);
                return Err(anyhow!("An error from server has jus occured"));
            }
        };

        // save the token and return a boolean
        let _ = db.insert(
            "token_creds",
            serde_json::to_string(&token_result)?.as_str(),
        )?;
        println!("{:?}", token_result);

        Ok(())
    }
    println!("Code: {code} and state: {state:?}");
    match run_exchange(state, code, db).await {
        Ok(_) => Ok(()),
        Err(e) => {

            Err(MyError::Custom(format!(
                "An error occured : {}",
                e.to_string() // make the test reqest and check if it goes
            )))
        }
    }
}
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Get the platform-specific app directory
            let app_handle = app.app_handle();
            let app_dir =
                app_data_dir(&app_handle.config()).ok_or("Unable to get app directory")?;
            let db_path: PathBuf = app_dir.join("sled_db");

            // Open or create the Sled database
            let db = sled::open(db_path)?;

            // Store the database in Tauri's state
            app.manage(db);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            generate_auth_url,
            exchange_auth_code
        ])
        .run(tauri::generate_context!())
        .expect("An error occured while initializing!!");
}
