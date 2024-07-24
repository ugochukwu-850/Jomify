use std::any::Any;
use std::f64::consts::E;
use std::fmt::Display;
use std::path::PathBuf;
use std::str::FromStr;

use super::errors::MyError;
use super::gear_structures::{AlbumItem, Artist, Image, SimplifiedArtist, Track};
use super::models::Track as ModelTrack;
use crate::menu::{gear_structures, models};
use crate::schema::{self, Tracks};
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;

impl Track {
    pub fn persist(&self, con: &mut SqliteConnection) -> Result<i32, MyError> {
        // build the main track and model instance
        // becuase this track always has an artist we are sure the option would not fail
        // call save on the album object
        if let Some(album) = &self.album {
            // the save method should return the id on sucess
            let _ = album.persist(con)?;
        }

        // call the save on the artists objects
        for artist in &self.artists {
            let _ = artist.persist(con)?;
        }

        // initialize every other variable and co-operate it into one single ModelTrack instance
        let instance = ModelTrack {
            album_id: Some(self.album.clone().unwrap().id),
            id: Some(self.id.clone()),
            name: Some(self.name.clone()),
            duration_ms: Some(self.duration_ms.clone() as usize as i32),
            href: Some(self.href.clone()),
            popularity: Some(self.popularity.clone()),
            object_type: Some(self.object_type.clone()),
        };

        match diesel::insert_into(Tracks::table)
            .values(&instance)
            .execute(con)
        {
            Ok(e) => {
                // now link the track to its artists
                let artist_track_instance: Vec<models::TrackArtist> = self
                    .artists
                    .iter()
                    .map(|artist| models::TrackArtist {
                        track_id: Some(self.id.clone()),
                        artist_id: Some(artist.id.clone()),
                    })
                    .collect();

                //insert the map for artist track into the db
                diesel::insert_into(schema::TrackArtists::table)
                    .values(&artist_track_instance)
                    .execute(con)
                    .unwrap();
            }
            Err(_e) => panic!("I could not catch this error I am too lazy"),
        };

        Ok(0)
    }
}

impl AlbumItem {
    /// Saves the item to the data base and returns a Result
    /// The Ok(id: AlbumId)
    pub fn persist(&self, con: &mut SqliteConnection) -> Result<i32, MyError> {
        let Self {
            album_type,
            artists,
            href,
            id,
            images,
            name,
            release_date,
        } = self.clone();
        // call the save on the artists objects
        for artist in artists {
            let _ = artist.persist(con)?;
        }

        // call save on the images too
        for image in images {
            let _ = image.persist(con, &id, "album")?;
        }

        // create an album database instance
        let instance = models::Album {
            id: Some(id.clone()),
            album_type: Some(album_type.clone()),
            href: Some(href.clone()),
            name: Some(name.clone()),
            release_date: Some(release_date.clone()),
            object_type: Some(album_type.clone()),
        };

        // save the instance
        match diesel::insert_into(schema::Albums::table)
            .values(&instance)
            .execute(con)
        {
            Ok(_) => {
                // now link the album to its artists
                let album_artist_instance: Vec<models::AlbumArtist> = self
                    .artists
                    .iter()
                    .map(|artist| models::AlbumArtist {
                        album_id: Some(self.id.clone()),
                        artist_id: Some(artist.id.clone()),
                    })
                    .collect();

                diesel::insert_into(schema::AlbumArtists::table)
                    .values(&album_artist_instance)
                    .execute(con)
                    .unwrap();
            }
            Err(e) => todo!(
                "I dont have r=stregheo for tis;;; rarrrh its spoiling my accuracy: \n {:?}",
                e
            ),
        };
        Ok(0)
    }

    /// Retrives the Album from DB using the id as a ref
    pub fn get_from_db(id: &i32) -> Result<Self, MyError> {
        todo!()
    }

    /// Carries out edit CRUD operation on the object
    pub fn update(id: &i32) -> Result<bool, MyError> {
        todo!()
    }
}

impl Artist {
    /// Saves the item to the data base and returns a Result
    /// The Ok(id: AlbumId)
    pub fn persist(&self, con: &mut SqliteConnection) -> Result<i32, MyError> {
        // create the db instance
        let mut artist_instance = models::Artist {
            id: Some(self.id.clone()),
            href: Some(self.href.clone()),
            name: Some(self.name.clone()),
            uri: Some(self.uri.clone()),
            object_type: Some(self.object_type.clone()),
            followers_id: None,
            popularity: Some(self.popularity.clone().try_into().unwrap()),
        };

        use schema::Followers::dsl::{href, total};
        let total_followers: i32 = self.followers.total.try_into().unwrap();
        // save the images
        for image in &self.images {
            image.persist(con, &self.id, "artist")?;
        }
        // now save and map the followers models
        let res: Result<models::Follower, diesel::result::Error> =
            diesel::insert_into(schema::Followers::table)
                .values((
                    href.eq(self.followers.href.clone()),
                    total.eq(total_followers),
                ))
                .get_result::<models::Follower>(con);
        match res {
            Ok(e) => {
                // update the artist with the followers id
                artist_instance.followers_id = e.id;
                if let Err(e) = diesel::insert_into(schema::Artists::table)
                    .values(&artist_instance)
                    .execute(con)
                {
                    // return
                }
            }
            Err(_) => todo!("Too lazy to implement the error too"),
        };
        Ok(0)
    }

    /// Retrives the Artist from DB using the id as a ref
    pub fn get_from_db(id: &i32) -> Result<Self, MyError> {
        todo!()
    }

    /// Carries out edit CRUD operation on the object
    pub fn update(id: &i32) -> Result<bool, MyError> {
        todo!()
    }
}

impl SimplifiedArtist {
    pub fn persist(&self, con: &mut SqliteConnection) -> Result<i32, MyError> {
        // create the db instance
        let artist_instance = models::Artist {
            id: Some(self.id.clone()),
            href: Some(self.href.clone()),
            name: Some(self.name.clone()),
            uri: Some(self.uri.clone()),
            object_type: Some(String::from("artist")),
            followers_id: None,
            popularity: None,
        };

        if let Err(_e) = diesel::insert_into(schema::Artists::table)
            .values(&artist_instance)
            .execute(con)
        {
            // return
        }
        Ok(0)
    }

    /// Retrives the Artist from DB using the id as a ref
    pub fn get_from_db(id: &i32) -> Result<Self, MyError> {
        todo!()
    }

    /// Carries out edit CRUD operation on the object
    pub fn update(id: &i32) -> Result<bool, MyError> {
        todo!()
    }
}

impl Image {
    pub fn get_local_url(&self) -> Result<String, MyError> {
        // the local id is the path field of the url
        let url = reqwest::Url::from_str(&self.url).expect("Hody");
        let mut path = PathBuf::new();
        path = path.join("./images").join(url.path());
        eprintln!("This is the path: {:?}", path);
        if path.exists() {
            let url = tauri::Url::from_file_path(path)
                .expect("Failed")
                .to_string();
            return Ok(url);
        } else {
            // download the file to the path from the original url
            let client = reqwest::Client::new();
            let r_path = std::sync::Arc::new(std::sync::Mutex::new(false));
            let rt_path = r_path.clone();
            let c_path = path.clone();
            // make the reqwest
            tauri::async_runtime::block_on(async move {
                let res = client.get(url).send().await;
                if let Ok(mut e) = res {
                    let mut bytes = Vec::new();
                    while let Ok(Some(byte)) = e.chunk().await {
                        println!("Loaded ----- chunk with len --- {}", byte.len());
                        bytes.extend(byte);
                    }
                    _ = std::fs::write(path, bytes);
                    *r_path.lock().unwrap() = true;
                }
            });

            if *rt_path.lock().unwrap() == true {
                return Ok(c_path.to_str().unwrap().to_string());
            }
            return Err(MyError::Custom("Failed to load the image".to_string()));
        }
    }
    pub fn persist(
        &self,
        con: &mut SqliteConnection,
        associated_object_id: &String,
        associated_object_type: &str,
    ) -> Result<i32, MyError> {
        use schema::Images::dsl::url;
        let x = self.get_local_url().unwrap();
        eprint!("{x:?}");
        // save the image to db first
        let image_id: models::Image = diesel::insert_into(schema::Images::table)
            .values(&(url.eq(x)))
            .get_result::<models::Image>(con)
            .unwrap();
        let image_id = image_id.id;

        match associated_object_type {
            "artist" => {
                // create the matching table
                let instance = models::ArtistImage {
                    artist_id: Some(associated_object_id.to_string()),
                    image_id,
                };

                // save the instance
                let _ = diesel::insert_into(schema::ArtistImages::table)
                    .values(&instance)
                    .execute(con)
                    .unwrap();
            }
            "album" => {
                // create the matching table
                let instance = models::AlbumImage {
                    album_id: Some(associated_object_id.to_string()),
                    image_id: image_id,
                };

                // save the instance
                let _ = diesel::insert_into(schema::AlbumImages::table)
                    .values(&instance)
                    .execute(con)
                    .unwrap();
            }
            _ => todo!("Sorry I did not consider saving for your object type"),
        };
        Ok(0)
    }

    pub fn get_from_db(id: &i32) -> Result<Self, MyError> {
        todo!()
    }

    pub fn update(id: &i32) -> Result<bool, MyError> {
        todo!()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use diesel::connection::Connection;
    use diesel::sqlite::SqliteConnection;
    use gear_structures::*;

    pub fn establish_test_connection() -> SqliteConnection {
        dotenvy::dotenv().ok();
        let database_url =
            std::env::var("DATABASE_URL").expect("failed to find the env variable DATABASE_URL");

        let mut conn =
            SqliteConnection::establish(&database_url).expect("Failed to establish db connection");
        clear_tables(&mut conn);
        conn
    }

    fn clear_tables(conn: &mut SqliteConnection) {
        diesel::delete(schema::Tracks::table)
            .execute(conn)
            .expect("Failed to clear Tracks table");

        diesel::delete(schema::Albums::table)
            .execute(conn)
            .expect("Failed to clear Albums table");

        diesel::delete(schema::Artists::table)
            .execute(conn)
            .expect("Failed to clear Artists table");

        diesel::delete(schema::AlbumArtists::table)
            .execute(conn)
            .expect("Failed to clear Artists table");
        diesel::delete(schema::ArtistImages::table)
            .execute(conn)
            .expect("Failed to clear Artists table");
        diesel::delete(schema::TrackArtists::table)
            .execute(conn)
            .expect("Failed to clear Artists table");
        diesel::delete(schema::Images::table)
            .execute(conn)
            .expect("Failed to clear Artists table");
        diesel::delete(schema::TrackImages::table)
            .execute(conn)
            .expect("Failed to clear Artists table");
        
    }

    #[test]
    fn test_persist_track() {
        let mut conn = establish_test_connection();

        // Setup test data
        let artist = Artist {
            href: "artist_href".to_string(),
            id: "artist_id".to_string(),
            name: "Artist Name".to_string(),
            uri: "artist_uri".to_string(),
            images: vec![],
            object_type: "artist".to_string(),
            followers: Followers {
                href: Some("followers_href".to_string()),
                total: 100,
            },
            genres: vec![],
            popularity: 50,
        };

        let album = AlbumItem {
            album_type: "album".to_string(),
            artists: vec![SimplifiedArtist {
                id: artist.id.clone(),
                href: artist.href.clone(),
                name: artist.name.clone(),
                uri: artist.uri.clone(),
            }],
            href: "album_href".to_string(),
            id: "oeifjrofijer".to_string(),
            images: vec![],
            name: "Album Name".to_string(),
            release_date: "2024-07-24".to_string(),
        };

        let track = Track {
            album: Some(album),
            artists: vec![SimplifiedArtist {
                id: artist.id.clone(),
                href: artist.href.clone(),
                name: artist.name.clone(),
                uri: artist.uri.clone(),
            }],
            name: "Track Name".to_string(),
            id: "track_id".to_string(),
            duration_ms: 200000,
            href: "track_href".to_string(),
            popularity: 70,
            object_type: "track".to_string(),
        };

        // Run the test
        let result = track.persist(&mut conn);
        eprintln!("result: {:?}", result);
        assert!(result.is_ok(), "Track should persist without error");
    }

    #[test]
    fn test_persist_album() {
        let mut conn = establish_test_connection();

        // Setup test data
        let artist = Artist {
            href: "artist_href".to_string(),
            id: "artist_id".to_string(),
            name: "Artist Name".to_string(),
            uri: "artist_uri".to_string(),
            images: vec![],
            object_type: "artist".to_string(),
            followers: Followers {
                href: Some("followers_href".to_string()),
                total: 100,
            },
            genres: vec![],
            popularity: 50,
        };

        let album = AlbumItem {
            album_type: "album".to_string(),
            artists: vec![SimplifiedArtist {
                id: artist.id.clone(),
                href: artist.href.clone(),
                name: artist.name.clone(),
                uri: artist.uri.clone(),
            }],
            href: "album_href".to_string(),
            id: "album_id111".to_string(),
            images: vec![],
            name: "Album Name".to_string(),
            release_date: "2024-07-24".to_string(),
        };

        // Run the test
        let result = album.persist(&mut conn);
        assert!(result.is_ok(), "Album should persist without error");
    }

    #[test]
    fn test_persist_artist() {
        let mut conn = establish_test_connection();

        // Setup test data
        let artist = Artist {
            href: "artist_href".to_string(),
            id: "artist_id".to_string(),
            name: "Artist Name".to_string(),
            uri: "artist_uri".to_string(),
            images: vec![],
            object_type: "artist".to_string(),
            followers: Followers {
                href: Some("followers_href".to_string()),
                total: 100,
            },
            genres: vec![],
            popularity: 50,
        };

        // Run the test
        let result = artist.persist(&mut conn);
        assert!(result.is_ok(), "Artist should persist without error");
    }

    #[test]
    fn test_persist_image() {
        let mut conn = establish_test_connection();

        // Setup test data
        let image = Image {
            height: Some(100),
            url: "https://res.cloudinary.com/dbjrhle0f/image/upload/v1720406307/dqhynx6ewehxivimtqrg.png".to_string(),
            width: Some(200),
        };

        // Run the test
        let result = image.persist(&mut conn, &"associated_object_id".to_string(), "artist");
        eprintln!("{result:?}");
        assert!(result.is_ok(), "Image should persist without error");
    }
}
