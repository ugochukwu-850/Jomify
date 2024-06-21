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
    // pub release_date_precision: String,
    pub total_tracks: u32,
    // pub type_: String,
    pub uri: String,
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
