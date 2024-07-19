use reqwest::Client;
use serde::{Deserialize, Serialize};

use crate::menu::gear_structures::{AlbumTrackItemResponse, PlaylistTrackItemsResponse};

use super::{
    auth_structures::User,
    errors::MyError,
    gear_structures::{
        AlbumItem, Albums, Artist, FeaturedPlaylistRequest, Image, NewReleaseAlbumResponse,
        SimpleifiedPlaylistItem, Playlists, SearchResult, SimplifiedArtist, Track,
    },
};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct HomeResponse {
    pub gallery: Vec<DefaultObjectsPreview>,
    pub featured_playlists: Vec<DefaultObjectsPreview>,
    pub new_release_album: Option<Vec<AlbumItem>>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct DefaultObjectsPreview {
    pub name: String,
    pub description: Option<String>,
    pub artist: Vec<SimplifiedArtist>,
    pub image: Vec<Image>,
    pub id: String,
    #[serde(rename = "type")]
    pub object_type: String,
    pub href: String,
    pub col: Option<i16>,
    pub row: Option<i16>,
    pub added_at: Option<String>,
    pub released_at: Option<String>,
}

impl Into<DefaultObjectsPreview> for SimpleifiedPlaylistItem {
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
            playlists: Playlists { items, total: _ },
        } = Self::get_featured_playlists(&access_token).await?;

        //create seperate tags for each aile
        // let items_len = items.len();
        let simple_featured_pl: Vec<DefaultObjectsPreview> =
            items.into_iter().map(|f| f.into()).collect();

        let NewReleaseAlbumResponse {
            albums: Albums { items, total: _ },
        } = Self::get_new_release_albums(&access_token).await?;
        let new_albums_field = items[..20].to_vec();
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
            new_release_album: Some(new_albums_field),
        })
    }

    async fn get_featured_playlists(
        access_token: &String,
    ) -> Result<FeaturedPlaylistRequest, MyError> {
        let r_client = Client::new();
        let queries = [("offset", "0"), ("limit", "50")];

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
                    println!("Text gotten from request for data length => {}", text.len());
                    let items: FeaturedPlaylistRequest = serde_json::from_str(text)?;
                    println!("Gotten response | Response message =>  {:?}", items.message);
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

    async fn get_new_release_albums(
        access_token: &String,
    ) -> Result<NewReleaseAlbumResponse, MyError> {
        let r_client = Client::new();
        let queries = [("offset", "0"), ("limit", "50")];

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
                    println!("Got text {}", text.len());
                    let items: NewReleaseAlbumResponse = serde_json::from_str(text)?;
                    println!("Got {:?} albums", items.albums.items.len());
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

impl User {
    pub async fn home(&mut self) -> Result<HomeResponse, MyError> {
        HomeResponse::new(self.get_auth_creds().await?.access_token).await
    }

    pub async fn search(&mut self, q: String) -> Result<SearchResult, MyError> {
        let access_token = self.get_auth_creds().await?.access_token;
        let client = Client::new();
        let queries = [
            ("offset", "0"),
            ("limit", "50"),
            ("q", &q),
            ("type", "album,artist,track,playlist"),
        ];

        match client
            .get(format!("https://api.spotify.com/v1/search/"))
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
                    let items: SearchResult = serde_json::from_str(text)?;
                    return Ok(items);
                }

                Err(MyError::Custom(text.to_owned()))
            }
            Err(e) => Err(MyError::Custom(format!(
                "Error from reqesting the tracks for albums: {}",
                e.to_string()
            ))),
        }
    }

    pub async fn get_artist(&mut self, id: String) -> Result<Artist, MyError> {
        let access_token = self.get_auth_creds().await?.access_token;
        let client = Client::new();

        match client
            .get(format!("https://api.spotify.com/v1/artists/{id}"))
            .bearer_auth(access_token)
            .send()
            .await
        {
            Ok(response) => {
                let status = response.status().is_success();
                let text = &response.text().await?;
                if status {
                    // parse the text to featured playlist
                    let item: Artist = serde_json::from_str(text)?;
                    return Ok(item);
                }

                Err(MyError::Custom(text.to_owned()))
            }
            Err(e) => Err(MyError::Custom(format!(
                "Error from reqesting the artist full data: {}",
                e.to_string()
            ))),
        }
    }

    pub async fn get_artist_albums(&mut self, id: String) -> Result<Vec<AlbumItem>, MyError> {
        let access_token = self.get_auth_creds().await?.access_token;
        let client = Client::new();
        let queries = [
            ("offset", "0"),
            ("limit", "50"),
            ("include_groups", "album,single,appears_on"),
        ];

        match client
            .get(format!("https://api.spotify.com/v1/artists/{id}/albums"))
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
                    let items: Albums = serde_json::from_str(text)?;
                    return Ok(items.items);
                }

                Err(MyError::Custom(text.to_owned()))
            }
            Err(e) => Err(MyError::Custom(format!(
                "Error from reqesting the tracks for albums: {}",
                e.to_string()
            ))),
        }
    }

    pub async fn get_tracks(
        &mut self,
        object_id: String,
        object_type: String,
    ) -> Result<Vec<Track>, MyError> {
        let access_token = self.get_auth_creds().await?.access_token;
        let client = Client::new();
        let queries = [("offset", "0"), ("limit", "50")];

        match object_type.as_str() {
            "album" | "single" | "compilation" | "ep" => {
                // make request and parse to list of tracks for albums
                match client
                    .get(format!(
                        "https://api.spotify.com/v1/albums/{object_id}/tracks"
                    ))
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
                            let items: AlbumTrackItemResponse = serde_json::from_str(text)?;
                            return Ok(items.track_details());
                        }

                        Err(MyError::Custom(text.to_owned()))
                    }
                    Err(e) => Err(MyError::Custom(format!(
                        "Error from reqesting the tracks for albums: {}",
                        e.to_string()
                    ))),
                }
            }
            "playlist" => {
                match client
                    .get(format!(
                        "https://api.spotify.com/v1/playlists/{object_id}/tracks"
                    ))
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
                            println!("Text response length {}", text.len());
                            let items: PlaylistTrackItemsResponse = serde_json::from_str(text)?;
                            println!(
                                "Playlist track response response lenght {:?}",
                                items.items.len()
                            );
                            return Ok(items.track_details());
                        }

                        Err(MyError::Custom(text.to_owned()))
                    }
                    Err(e) => Err(MyError::Custom(format!(
                        "Error from reqesting the tracks for albums: {}",
                        e.to_string()
                    ))),
                }
            }
            _ => {
                todo!()
            }
        }
    }
}
