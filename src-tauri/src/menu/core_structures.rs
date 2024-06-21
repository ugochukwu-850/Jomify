use oauth2::reqwest::async_http_client;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::fmt::format;

use super::{
    errors::MyError,
    gear_structures::{Albums, Artist, FeaturedPlaylistRequest, Image, NewReleaseAlbumResponse, PlaylistItem, Playlists},
};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct HomeResponse {
    pub gallery: Vec<DefaultObjectsPreview>,
    pub featured_playlists: Vec<DefaultObjectsPreview>,
    albums: Option<Vec<DefaultObjectsPreview>>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct DefaultObjectsPreview {
    pub name: String,
    pub description: Option<String>,
    pub artist: Vec<Artist>,
    pub image: Vec<Image>,
    pub id: String,
    pub object_type: String,
    pub href: String,
    pub col: Option<i16>,
    pub row: Option<i16>,
    pub added_at: Option<String>,
    pub released_at: Option<String>,
}

impl Into<DefaultObjectsPreview> for PlaylistItem {
    fn into(self) -> DefaultObjectsPreview {
        DefaultObjectsPreview {
            name: self.name,
            // small vector just because the creator stays in the rendering position of the artists
            artist: [self.owner].to_vec(),
            image: self.images,
            description: self.description,
            id: self.id,
            object_type: "playlist".to_string(),
            href: self.href,
            col: Some(2),
            row: Some(2),
            added_at: None,
            released_at: None,
        }
    }
}

impl HomeResponse {
    pub async fn new(access_token: String) -> Result<Self, MyError> {
        // get the featured playlists
        let FeaturedPlaylistRequest {
            message: _,
            playlists: Playlists { items, total },
        } = Self::get_featured_playlists(&access_token).await?;

        //create seperate tags for each aile
        let items_len = items.len();
        let simple_featured_pl: Vec<DefaultObjectsPreview> =
            items.into_iter().map(|f| f.into()).collect();

        let NewReleaseAlbumResponse { albums: Albums {items, total} } = Self::get_new_release_albums(&access_token).await?;

        // convert the album to displayable type
        let new_albums: Vec<DefaultObjectsPreview> = items
            .into_iter()
            .map(|d| {
                let (col, row) = {
                    match d.album_type.as_str() {
                        "single" => (1, 1),
                        "compilation" => (2, 2),
                        "album" => (1, 2),
                        _ => (1, 1),
                    }
                };

                DefaultObjectsPreview {
                    name: d.name,
                    description: None,
                    artist: d.artists,
                    image: d.images,
                    id: d.id,
                    object_type: d.album_type,
                    href: d.href,
                    col: Some(col),
                    row: Some(row),
                    added_at: None,
                    released_at: Some(d.release_date),
                }
            })
            .collect();
        let mut gallery = Vec::new();
        gallery.extend(simple_featured_pl[6..].to_owned());
        gallery.extend(new_albums);
        let featured_playlists = simple_featured_pl[..6].to_vec();
        Ok(Self {
            gallery,
            featured_playlists,
            albums: None,
        })


    }

    async fn get_featured_playlists(
        access_token: &String,
    ) -> Result<FeaturedPlaylistRequest, MyError> {
        let r_client = Client::new();
        let queries = [("offset", "0"), ("limit", "20")];

        match r_client
            .get("https://api.spotify.com/v1/browse/featured-playlists")
            .query(&queries)
            .bearer_auth(access_token)
            .send()
            .await
        {
            Ok(response) => {
                let status = response.status().is_success();
                let text = &response.text().await?;
                if status {
                    // parse the text to featured playlist
                    println!("{}", text);
                    let items: FeaturedPlaylistRequest = serde_json::from_str(text)?;
                    println!("{items:?}");
                    return Ok(items);
                }
                Err(MyError::Custom(text.to_owned()))
            }
            Err(e) => {
                // let x = Err(MyError::Custom(format!(
                //     "Error making reqwest for featured Item: {}",
                //     e.to_string(),
                // )));

                Err(MyError::Custom(format!(
                    "Error from reqesting the reource: {}",
                    e.to_string()
                )))
            }
        }
    }

    async fn get_new_release_albums(access_token: &String) -> Result<NewReleaseAlbumResponse, MyError> {
        let r_client = Client::new();
        let queries = [("offset", "0"), ("limit", "20")];

        match r_client
            .get("https://api.spotify.com/v1/browse/new-releases")
            .query(&queries)
            .bearer_auth(access_token)
            .send()
            .await
        {
            Ok(response) => {
                let status = response.status().is_success();
                let text = &response.text().await?;
                if status {
                    // parse the text to featured playlist
                    println!("{}", text);
                    let items: NewReleaseAlbumResponse = serde_json::from_str(text)?;
                    println!("{items:?}");
                    return Ok(items);
                }

                Err(MyError::Custom(text.to_owned()))
            }
            Err(e) => Err(MyError::Custom(format!(
                "Error from reqesting the reource for albums: {}",
                e.to_string()
            ))),
        }
    }
}
