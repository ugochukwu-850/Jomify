

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
![Pre-release](https://img.shields.io/github/v/release/ugochukwu-850/Jomify?include_prereleases)
![Downloads](https://img.shields.io/github/downloads/ugochukwu-850/Jomify/total)


# Jomify Music App

Jomify is your favorite music player reimagined, offering a native experience on all major PC operating systems. Enjoy your music offline with the ability to download audio tracks, ensuring you always have access to your tunes wherever you go.

**Raw Description:** "Powered by tauri, YT, Spotify and Rodio" Jomify is an open source solution to the endless quarks of streaming music from the internet. Jomify is just like your favorite music app infact it is still in an alpha stage and I was obviously imitating Spotify's design (principles) - don't judge me the keep yapping about following their designs in their docs - . 

**How it Works:** Since this is an OSS , I would love to explain how it actually works . Like you'r five , Jomify retrieve music meta info from spotify and creates the corresponding audio data only when its needs to play it, because it saves this file permenantly to your filesytem you can enjoy the music even while offline.

**Geeks:**: Not much of one myself , but Jomify fetches info of a file from spotify , downloads the video off Yt and seperates the video from the audio. It then plays these two sources seperately , but on command.

**Warning: THIS APP IS STILL UNDER DEVELOPMENT**

## Key Features

- [x]  2OAuth with Spotify
- [x]  Home View
- [x]  Artist View 
- [x]  Album, Single , Ep, and Playlist views
- [x]  Album, Track and Artist Search
- [x]  Add to Queue
- [x]  Play Next
- [x]  Download tracks, Playlist, Albums , Singles, Eps
- [x]  App Navigation
- [x]  Playback Controls
- [x]  Volume 
- [x]  Seeking
- [x]  Persistent State Management
- [ ]  Alot More


## Usage 
Since the app is not yet verified by spotify, you cannot just log in with your spotify ID
Instead i have created a free account where you can log in as the user and access our app

**Follow these steps to test the app as a beta User**
1. Download your systems executables or installation files from the release page 

2. Install and launch

3. On Logging screen -> Click log in with spotify

4. Use this details to login with spotify on the spotify auth page
   - email: megumifushigiro850@gmail.com
   - password: #jomobetauser

5. You should be taken back to the home page.
ps: Your default feed may be tailored to Nigeria but this is because the props account is created with Local_ as Nigeria.

6. You can save this login in details incase of subsequent authentication

**Ps:** If you want to experience the app as with your personal spotify account , you can message me to add you to the beta users.




## Demo

![Demo Video](https://res.cloudinary.com/dbjrhle0f/video/upload/v1720406313/ahzcl3azupqnr8g3wbyx.mp4)
## Screenshots

![Screenshots](https://res.cloudinary.com/dbjrhle0f/image/upload/v1720406307/dqhynx6ewehxivimtqrg.png)

![Screenshots](https://res.cloudinary.com/dbjrhle0f/image/upload/v1720406307/vuw21ki1in5q6v9u3fi3.png)


![Screenshots](https://res.cloudinary.com/dbjrhle0f/image/upload/v1720406307/q3nks0zvwjbg8oezyk5n.png)


![Screenshots](https://res.cloudinary.com/dbjrhle0f/image/upload/v1720406308/ofhbpapgyooi47oqnx7f.png)


## Tech Stack

**Client:** React, Type Script, Material UI

**Server:** Rust, Tauri

**Audio Pre-processing:** FFMPEG

**Audio Stream Playback:**: Rodio


## Installation

Install my-project with npm

```bash
  # Setup Tauri for development
  https://tauri.app/v1/guides/getting-started/prerequisites

  # Clone the repository
  git clone https://github.com/ugochukwu-850/jomify.git

  # Navigate into the directory
  cd jomify

  # Install dependencies
  npm install

  # Start the development server
  npm run tauri dev

  # Make your customizations and Build
  cargo tauri build
  ```
    
## Authors

- [Ugochukwu Chizaram .O.](https://www.github.com/ugochukwu-850)


## Acknowledgements

 - [Spotify](https://developer.spotify.com/documentation/web-api)
 - [Readme Templates](https://readme.so/editor)
 - [Youtube](https://youtube.com/)
 - [Materia UI](https://mui.com/material-ui/)




## Appendix

No additional information - This documentation is still under development


## Contributing

Contributions are always welcome!

See `contributing.md` for ways to get started.

Please adhere to this project's `code of conduct`.


## Support

For support, email ugochukwuchizaram850@gmail.com or join my Discord.


## License
Jomify is licensed under the [MIT](https://choosealicense.com/licenses/mit/) License. See the LICENSE link for details.



## FAQ

No data here

