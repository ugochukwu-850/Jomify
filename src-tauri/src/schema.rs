// @generated automatically by Diesel CLI.

diesel::table! {
    AlbumArtists (album_id, artist_id) {
        album_id -> Nullable<Text>,
        artist_id -> Nullable<Text>,
    }
}

diesel::table! {
    AlbumImages (album_id, image_id) {
        album_id -> Nullable<Text>,
        image_id -> Nullable<Integer>,
    }
}

diesel::table! {
    Albums (id) {
        id -> Nullable<Text>,
        album_type -> Nullable<Text>,
        href -> Nullable<Text>,
        name -> Nullable<Text>,
        release_date -> Nullable<Text>,
        object_type -> Nullable<Text>,
    }
}

diesel::table! {
    ArtistImages (artist_id, image_id) {
        artist_id -> Nullable<Text>,
        image_id -> Nullable<Integer>,
    }
}

diesel::table! {
    Artists (id) {
        id -> Nullable<Text>,
        href -> Nullable<Text>,
        name -> Nullable<Text>,
        uri -> Nullable<Text>,
        object_type -> Nullable<Text>,
        followers_id -> Nullable<Integer>,
        popularity -> Nullable<Integer>,
    }
}

diesel::table! {
    Followers (id) {
        id -> Nullable<Integer>,
        href -> Nullable<Text>,
        total -> Nullable<Integer>,
    }
}

diesel::table! {
    Images (id) {
        id -> Nullable<Integer>,
        height -> Nullable<Integer>,
        url -> Text,
        width -> Nullable<Integer>,
    }
}

diesel::table! {
    TrackArtists (track_id, artist_id) {
        track_id -> Nullable<Text>,
        artist_id -> Nullable<Text>,
    }
}

diesel::table! {
    TrackImages (track_id, image_id) {
        track_id -> Nullable<Text>,
        image_id -> Nullable<Integer>,
    }
}

diesel::table! {
    Tracks (id) {
        id -> Nullable<Text>,
        album_id -> Nullable<Text>,
        name -> Nullable<Text>,
        duration_ms -> Nullable<Integer>,
        href -> Nullable<Text>,
        popularity -> Nullable<Integer>,
        object_type -> Nullable<Text>,
    }
}

diesel::joinable!(AlbumArtists -> Albums (album_id));
diesel::joinable!(AlbumArtists -> Artists (artist_id));
diesel::joinable!(AlbumImages -> Albums (album_id));
diesel::joinable!(AlbumImages -> Images (image_id));
diesel::joinable!(ArtistImages -> Artists (artist_id));
diesel::joinable!(ArtistImages -> Images (image_id));
diesel::joinable!(Artists -> Followers (followers_id));
diesel::joinable!(TrackArtists -> Artists (artist_id));
diesel::joinable!(TrackArtists -> Tracks (track_id));
diesel::joinable!(TrackImages -> Images (image_id));
diesel::joinable!(TrackImages -> Tracks (track_id));
diesel::joinable!(Tracks -> Albums (album_id));

diesel::allow_tables_to_appear_in_same_query!(
    AlbumArtists,
    AlbumImages,
    Albums,
    ArtistImages,
    Artists,
    Followers,
    Images,
    TrackArtists,
    TrackImages,
    Tracks,
);
