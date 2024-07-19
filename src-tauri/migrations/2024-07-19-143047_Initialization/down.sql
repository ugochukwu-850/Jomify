-- This file should undo anything in `up.sql`
DROP TABLE IF EXISTS ArtistImages;
DROP TABLE IF EXISTS TrackImages;
DROP TABLE IF EXISTS AlbumImages;

-- Drop Join Tables for Artists
DROP TABLE IF EXISTS TrackArtists;
DROP TABLE IF EXISTS AlbumArtists;

-- Drop Main Tables
DROP TABLE IF EXISTS Tracks;
DROP TABLE IF EXISTS Albums;
DROP TABLE IF EXISTS Artists;

-- Drop Auxiliary Tables
DROP TABLE IF EXISTS Images;
DROP TABLE IF EXISTS Followers;
