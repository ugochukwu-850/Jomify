use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]

pub struct FeaturedPlaylistRequest {
    pub message: String,
    pub playlists: Playlists,
}

#[derive(Deserialize, Serialize, Debug, Clone)]

pub struct Playlists {
    pub items: Vec<PlaylistItem>,
    // pub limit: u32,
    // pub next: Option<String>,
    // pub offset: u32,
    // pub previous: Option<String>,
    pub total: u32,
}

#[derive(Deserialize, Serialize, Debug, Clone)]

pub struct PlaylistItem {
    // pub collaborative: bool,
    pub description: Option<String>,
    // pub external_urls: ExternalUrls,
    pub href: String,
    pub id: String,
    pub images: Vec<Image>,
    pub name: String,
    pub owner: Artist,
    // pub primary_color: Option<String>,
    // pub public: bool,
    // pub snapshot_id: String,
    // pub tracks: Tracks,
    // pub type_: String,
    pub uri: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]

pub struct ExternalUrls {
    pub spotify: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]

pub struct Image {
    pub height: Option<u32>,
    pub url: String,
    pub width: Option<u32>,
}

// #[derive(Deserialize, Serialize, Debug, Clone)]

// pub struct Owner {
//     pub display_name: String,
//     // pub external_urls: ExternalUrls,
//     pub href: String,
//     pub id: String,
//     // pub type_: String,
//     pub uri: String,
// }

#[derive(Deserialize, Serialize, Debug, Clone)]

pub struct Artist {
    // pub external_urls: ExternalUrls,
    pub href: String,
    pub id: String,
    #[serde(alias = "display_name")]
    pub name: String,
    // pub type_: String,
    pub uri: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Tracks {
    pub href: String,
    pub total: u32,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct TrackDetail {
    pub name: String,
    #[serde(alias = "duration_ms")]
    pub duration: u128,
    pub album: AlbumItem,
    pub artists: Vec<Artist>,
    pub url: String,
    pub id: String,
    pub popularity: i32,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct NewReleaseAlbumResponse {
    pub albums: Albums,
}

#[derive(Deserialize, Serialize, Debug, Clone)]

pub struct Albums {
    // pub href: String,
    pub items: Vec<AlbumItem>,
    // pub limit: u32,
    // pub next: Option<String>,
    // pub offset: u32,
    // pub previous: Option<String>,
    pub total: u32,
}

#[derive(Deserialize, Serialize, Debug, Clone)]

pub struct AlbumItem {
    pub album_type: String,
    pub artists: Vec<Artist>,
    // pub available_markets: Vec<String>,
    // pub external_urls: ExternalUrls,
    pub href: String,
    pub id: String,
    pub images: Vec<Image>,
    pub name: String,
    pub release_date: String,

}

#[derive(Deserialize, Serialize, Debug, Clone)]

pub struct UserAlbumResponse {
    pub items: Vec<UserAlbumItem>,
    // pub limit: u32,
    // pub next: Option<String>,
    // pub offset: u32,
    // pub previous: Option<String>,
    pub total: u32,
}

#[derive(Deserialize, Serialize, Debug, Clone)]

pub struct UserAlbumItem {
    pub added_at: String,
    pub album: AlbumItem,
}

// Details for track response

#[derive(Debug, Deserialize, Clone)]
pub struct PlaylistTrackItemsResponse {
    pub items: Vec<PlaylistTrackItemDetail>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct PlaylistTrackItemDetail {
    pub track: Track,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Track {
    pub album: Option<AlbumItem>,
    pub artists: Vec<Artist>,
    pub name: String,
    pub id: String,
    pub duration_ms: u128,
    pub href: String,
    pub popularity: i32,
    #[serde(alias = "type")]
    pub object_type: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct AlbumTrackDetail {
    pub artists: Vec<Artist>,
    pub name: String,
    pub id: String,
    pub duration_ms: u128,
    pub href: String,
    #[serde(alias="type")]
    pub object_type: String,
}

#[derive(Debug, Deserialize)]
pub struct AlbumTrackItemResponse {
    pub items: Vec<AlbumTrackDetail>,
}

#[derive(Debug, Deserialize)]
pub struct TrackItemsDetails {
    pub items: Vec<AlbumTrackDetail>,
}

impl AlbumTrackItemResponse {
    pub fn track_details(&self) -> Vec<Track> {
        self
            .items
            .iter()
            .map(|d| {
                let d = d.clone();
                Track {
                    album: None,
                    artists: d.artists,
                    name: d.name,
                    id: d.id,
                    duration_ms: d.duration_ms,
                    href: d.href,
                    popularity: 0,
                    object_type: d.object_type,
                }
            })
            .collect()
    }
}

impl PlaylistTrackItemsResponse {
    pub fn track_details(&self) -> Vec<Track> {
        self.items.iter().map(|data| {
            data.clone().track
        }).collect()
    }
}
