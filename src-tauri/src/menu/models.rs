use diesel::prelude::*;
use diesel::Queryable;
use crate::schema::*;

#[derive(Debug, Queryable, Identifiable, Associations, Insertable)]
#[diesel(table_name = AlbumArtists)]
#[diesel(primary_key(album_id, artist_id))]
#[diesel(belongs_to(Album, foreign_key = album_id))]
#[diesel(belongs_to(Artist, foreign_key = artist_id))]
pub struct AlbumArtist {
    pub album_id: Option<String>,
    pub artist_id: Option<String>,
}

#[derive(Debug, Queryable, Identifiable, Associations, Insertable)]
#[diesel(table_name = AlbumImages)]
#[diesel(primary_key(album_id, image_id))]
#[diesel(belongs_to(Album, foreign_key = album_id))]
#[diesel(belongs_to(Image, foreign_key = image_id))]
pub struct AlbumImage {
    pub album_id: Option<String>,
    pub image_id: Option<i32>,
}

#[derive(Debug, Queryable, Identifiable, Insertable, Selectable)]
#[diesel(table_name = Albums)]
#[diesel(primary_key(id))]
pub struct Album {                       //////
    pub id: Option<String>,
    pub album_type: Option<String>,
    pub href: Option<String>,
    pub name: Option<String>,
    pub release_date: Option<String>,
    pub object_type: Option<String>,
}

#[derive(Debug, Queryable, Identifiable, Associations, Insertable)]
#[diesel(table_name = ArtistImages)]
#[diesel(primary_key(artist_id, image_id))]
#[diesel(belongs_to(Artist, foreign_key = artist_id))]
#[diesel(belongs_to(Image, foreign_key = image_id))]
pub struct ArtistImage {
    pub artist_id: Option<String>,
    pub image_id: Option<i32>,
}

#[derive(Debug, Queryable, Identifiable, Associations, Insertable, Selectable)]
#[diesel(table_name = Artists)]
#[diesel(primary_key(id))]
#[diesel(belongs_to(Follower, foreign_key = followers_id))]
pub struct Artist {
    pub id: Option<String>,
    pub href: Option<String>,
    pub name: Option<String>,
    pub uri: Option<String>,
    pub object_type: Option<String>,
    pub followers_id: Option<i32>,
    pub popularity: Option<i32>,
}

#[derive(Debug, Queryable, Identifiable)]
#[diesel(table_name = Followers)]
#[diesel(primary_key(id))]
pub struct Follower {
    pub id: Option<i32>,
    pub href: Option<String>,
    pub total: Option<i32>,
}

#[derive(Debug, Queryable, Identifiable, Selectable)]
#[diesel(table_name = Images)]
#[diesel(primary_key(id))]
pub struct Image {
    pub id: Option<i32>,
    pub height: Option<i32>,
    pub url: String,
    pub width: Option<i32>,
}

#[derive(Debug, Queryable, Identifiable, Associations, Insertable)]
#[diesel(table_name = TrackArtists)]
#[diesel(primary_key(track_id, artist_id))]
#[diesel(belongs_to(Artist, foreign_key = artist_id))]
#[diesel(belongs_to(Track, foreign_key = track_id))]
pub struct TrackArtist {
    pub track_id: Option<String>,
    pub artist_id: Option<String>,
}

#[derive(Debug, Queryable, Identifiable, Associations)]
#[diesel(table_name = TrackImages)]
#[diesel(primary_key(track_id, image_id))]
#[diesel(belongs_to(Image, foreign_key = image_id))]
#[diesel(belongs_to(Track, foreign_key = track_id))]
pub struct TrackImage {
    pub track_id: Option<String>,
    pub image_id: Option<i32>,
}

#[derive(Debug, Queryable, Identifiable, Associations, Insertable, Selectable)]
#[diesel(table_name = Tracks)]
#[diesel(primary_key(id))]
#[diesel(belongs_to(Album, foreign_key = album_id))]
pub struct Track {
    pub id: Option<String>,
    pub album_id: Option<String>,
    pub name: Option<String>,
    pub duration_ms: Option<i32>,
    pub href: Option<String>,
    pub popularity: Option<i32>,
    pub object_type: Option<String>,
}
