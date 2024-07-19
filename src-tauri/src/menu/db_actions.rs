use super::errors::MyError;
use super::gear_structures::{AlbumItem, Artist, SimplifiedArtist, Track};
use super::models::Track as ModelTrack;
use crate::schema::Tracks;
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;

impl Track {
    pub fn persist(&self, con: &mut SqliteConnection) -> Result<Option<Self>, MyError> {
        // build the main track and model instance
        // becuase this track always has an artist we are sure the option would not fail

        // call save on the album object
        if let Some(album) = &self.album {
            // the save method should return the id on sucess
            if let Ok(s) = album.persist() {
                // if successful update the album_id for the track db image
                //
            } else {
                // else set it to None; this would never happen
                // infact on successful testing change it to an error instead
                //
            };
        }

        // call the save on the artists objects
        for artist in &self.artists {
            let _ = artist.persist()?;
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

        diesel::insert_into(Tracks::table)
            .values(&instance)
            .execute(con)
            .expect("Error saving new post");

        Err(MyError::Custom("Example error".to_string()))
    }
}

impl AlbumItem {
    /// Saves the item to the data base and returns a Result
    /// The Ok(id: AlbumId)
    pub fn persist(&self) -> Result<String, MyError> {
        todo!()
    }

    /// Retrives the Album from DB using the id as a ref
    pub fn get_from_db(id: &i32) -> Result<Self, MyError> {
        todo!()
    }

    /// Carries out edit CRUD operation on the object
    pub fn edit(id: &i32) -> Result<bool, MyError> {
        todo!()
    }
}

impl Artist {
    /// Saves the item to the data base and returns a Result
    /// The Ok(id: AlbumId)
    pub fn persist(&self) -> i32 {
        todo!()
    }

    /// Retrives the Artist from DB using the id as a ref
    pub fn get_from_db(id: &i32) -> Result<Self, MyError> {
        todo!()
    }

    /// Carries out edit CRUD operation on the object
    pub fn edit(id: &i32) -> Result<bool, MyError> {
        todo!()
    }
}

impl SimplifiedArtist {
    /// Saves the item to the data base and returns a Result
    /// The Ok(id: AlbumId)
    /// Since this is a simplified artist is would still save to the artist table
    /// It would do this by calling Artist::new()
    /// It would only try to create a new instance if one has not been found already
    /// Since creating a artist model is an async function and we dont want to waste time on it
    pub fn persist(&self) -> Result<i32, MyError> {
        todo!()
    }

    /// Retrives the Artist from DB using the id as a ref
    pub fn get_from_db(id: &i32) -> Result<Self, MyError> {
        todo!()
    }

    /// Carries out edit CRUD operation on the object
    pub fn edit(id: &i32) -> Result<bool, MyError> {
        todo!()
    }
}
