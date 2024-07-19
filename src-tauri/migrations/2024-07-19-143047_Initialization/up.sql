-- Your SQL goes here
-- Create Followers Table
CREATE TABLE Followers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    href TEXT,
    total INTEGER
);

-- Create Images Table
CREATE TABLE Images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    height INTEGER,
    url TEXT NOT NULL,
    width INTEGER
);

-- Create Artists Table
CREATE TABLE Artists (
    id TEXT PRIMARY KEY,
    href TEXT,
    name TEXT,
    uri TEXT,
    object_type TEXT,
    followers_id INTEGER,
    popularity INTEGER,
    FOREIGN KEY (followers_id) REFERENCES Followers(id)
);

-- Create Albums Table
CREATE TABLE Albums (
    id TEXT PRIMARY KEY,
    album_type TEXT,
    href TEXT,
    name TEXT,
    release_date TEXT,
    object_type TEXT
);

-- Create Tracks Table
CREATE TABLE Tracks (
    id TEXT PRIMARY KEY,
    album_id TEXT,
    name TEXT,
    duration_ms INTEGER,
    href TEXT,
    popularity INTEGER,
    object_type TEXT,
    FOREIGN KEY (album_id) REFERENCES Albums(id)
);

-- Create Join Table for Albums and Artists (Many-to-Many)
CREATE TABLE AlbumArtists (
    album_id TEXT,
    artist_id TEXT,
    FOREIGN KEY (album_id) REFERENCES Albums(id),
    FOREIGN KEY (artist_id) REFERENCES Artists(id),
    PRIMARY KEY (album_id, artist_id)
);

-- Create Join Table for Tracks and Artists (Many-to-Many)
CREATE TABLE TrackArtists (
    track_id TEXT,
    artist_id TEXT,
    FOREIGN KEY (track_id) REFERENCES Tracks(id),
    FOREIGN KEY (artist_id) REFERENCES Artists(id),
    PRIMARY KEY (track_id, artist_id)
);

-- Create Join Table for Albums and Images (One-to-Many)
CREATE TABLE AlbumImages (
    album_id TEXT,
    image_id INTEGER,
    FOREIGN KEY (album_id) REFERENCES Albums(id),
    FOREIGN KEY (image_id) REFERENCES Images(id),
    PRIMARY KEY (album_id, image_id)
);

-- Create Join Table for Tracks and Images (One-to-Many)
CREATE TABLE TrackImages (
    track_id TEXT,
    image_id INTEGER,
    FOREIGN KEY (track_id) REFERENCES Tracks(id),
    FOREIGN KEY (image_id) REFERENCES Images(id),
    PRIMARY KEY (track_id, image_id)
);

-- Create Join Table for Artists and Images (One-to-Many)
CREATE TABLE ArtistImages (
    artist_id TEXT,
    image_id INTEGER,
    FOREIGN KEY (artist_id) REFERENCES Artists(id),
    FOREIGN KEY (image_id) REFERENCES Images(id),
    PRIMARY KEY (artist_id, image_id)
);
