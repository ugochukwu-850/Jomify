[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
![Pre-release](https://img.shields.io/github/v/release/ugochukwu-850/Jomify?include_prereleases)
![Downloads](https://img.shields.io/github/downloads/ugochukwu-850/Jomify/total)

> [!WARNING]
> Development Mode: This app is still under active development 

# Jomify Music App

Jomify is your favorite music player reimagined, offering a native experience on all major PC operating systems. Enjoy your music offline with the ability to download audio tracks, ensuring you always have access to your tunes wherever you go.

| **Raw Summary:** "Powered by Tauri, YT, Spotify, and Rodio," Jomify is an open-source solution to the endless quirks of streaming music from the internet. Jomify is just like your favorite music app; in fact, it is still in an alpha stage, and I was obviously imitating Spotify's design principles - don't judge me, they keep yapping about following their designs in their docs.

| **How it Works:** Since this is OSS, I would love to explain how it actually works. Like you're five, Jomify retrieves music meta info from Spotify and creates the corresponding audio data only when it needs to play it. Because it saves this file permanently to your filesystem, you can enjoy the music even while offline.

| **Geeks:** Not much of one myself, but Jomify fetches info of a file from Spotify, downloads the video off YT, and separates the video from the audio. It then plays these two sources separately, but on command.

> [!NOTE]
> [Click here to view demo](https://drive.google.com/file/d/14r6PIv0TJ2wDySyXfrCVYcuM2fs2Y0dz/view?usp=sharing).

### What does it Do?

Nice question. Basically, this app allows you to download and stream almost any music offline. It allows you to have your favorite music playing app but offline and free. Leveraging technologies like video stripping from ffmpeg and handsomely crafted methods, the app downloads video covers of songs off YouTube, then separates these two into two separate files (Audio and Video), allowing you to stream the song and, at will, watch the video. This runs entirely on your system, ensuring optimal security. In a nutshell, this application should grant you all the features of your favorite player and even more, all without any security risks.

### What technologies did you use and Why did you use them?

I like this one because deciding a stack took me a while. So, we use Tauri for Graphics Rendering (basically just packaging the app as a desktop app), Vite + TypeScript as the primary coding language + React + Material UI for front-end design and development, and for the backend we used Rust as our backend language, Rodio for audio playing, and rust_ytdl for video downloading, and lastly ffmpeg for video pre-processing. For the database, we used sled for user settings and tweak variables, and for Tracks relations and organization we used Sqlite3.

Being my first time building a desktop app, I took a safety approach, using Rust and TypeScript as primary languages for back and front end respectively. I used Rodio for handling playback because it is very easy to set up and use, especially when considering native dev. For packaging and building of front-end resources, I used npm and Vite to ensure speed during development. I used React as the main front-end UI library and Material UI to aid in building components as it helps design with a standard and is easy to use. I used rust_ytdl for YouTube because it is actively maintained - in fact, my code failed yesterday due to a YouTube change; it took the dev team of the crate less than 48 hours to adapt the crate to those changes, allowing for an almost bump-less dev flow. Finally, I used ffmpeg for video preprocessing because ffmpeg is simply the best I can get out there; quite easy to use, open-source, and trusted by millions of devs. There's obviously nothing not to like about it.

### Challenges I ran into

- **Setting up Cross-platform distribution:** This was one of the most frustrating parts of the entire dev, but thanks to ChatGPT and countless hours of debugging and research, I was able to figure out how it actually works. You see, Tauri can compile for different systems and architectures, so to create a release version you either do it manually or automatically using GitHub or any other viable options (CrabNuela).
  - **The Core challenge:** The main challenge was actually figuring out how to install the binaries necessary for the sidecar to work, and then debugging it for each individual OS the application currently supports.
- **Multi-threading Palava:**
  - **Core challenge:** Async programming with Rust can be a pain, but as if that was not enough, combine it with the limited knowledge I had about Rodio, I fell into countless failures.
    **Notable occurrence:** So basically, rodio::sink has to have its (stream, stream_handle) objects in scope, else it won't be able to work, and this rodio::sink is the player handle for the project. So, I felt I could just 
    put sink into state, but this would inadvertently cause the stream and stream handle to be dropped. Although it does not sound like much of a challenge, at the time it was, and it took me hours of refactoring, debugging, and changing of program logic before I could get a working model.
    **Solution:** I simply created a new thread - on app initialization - for the play action. This thread lives throughout the life of the application, allowing stream and stream handle to stay in scope. But then how did you handle the remaining path of your app that needed handles to sink? For that one, I simply removed the access and instead used a pipeline flow of tauri::events to handle sink actions.
- **Config Issues:** If you must know, one of the major issues with multi-platform dev is configuration. So in Tauri, it's not advisable to use front-end requests; instead, using a backend HTTP API is encouraged.
  This is because of security risks of using a Web window HTTP client. Instead, a safer approach would be a native HTTP client. This caused my code not to work as expected, and again it was really hard to debug since it was a config issue; there aren't really many logs to look at. Another occurrence was on the authentication system, so the project uses 2OAuth. My implementation of the PKCE 2OAuth system was where the flaw lay.
  You see, in dev mode Tauri apps run a small dev server for the front end, so using a route on the front end I could retrieve the code and state and further exchange it for the token. But in the build version of Tauri apps, there are no front-end dev servers, so that would fail every time, with a weird ("-- localhost could not connect--") error.
  When I found this out while passing the gates of GitHub issue and Stack Overflow, I had to change my auth logic, using a TCP listener to imitate an oauthcallback route instead.

These are just a few; I have tales untold about this project. I would try my best to answer any questions you ask in the discussions.

## Key Features

- [x]  2OAuth with Spotify
- [x]  Home View
- [x]  Artist View 
- [x]  Album, Single, EP, and Playlist views
- [x]  Album, Track, and Artist Search
- [x]  Add to Queue
- [x]  Play Next
- [x]  Download tracks, Playlists, Albums, Singles, EPs
- [x]  App Navigation
- [x]  Playback Controls
- [x]  Volume 
- [x]  Seeking
- [x]  Persistent State Management
- [ ]  A lot More

## Usage 

Since the app is not yet verified by Spotify, you cannot just log in with your Spotify ID.
Instead, I have created a free account where you can log in as the user and access our app.

**Follow these steps to test the app as a beta User:**

1. Download your system's executables or installation files from the release page.
2. Install and launch.
3. On the logging screen, click "Log in with Spotify."
4. Use these details to log in with Spotify on the Spotify auth page:
   - Email: megumifushigiro850@gmail.com
   - Password: #jomobetauser
5. You should be taken back to the home page.
   PS: Your default feed may be tailored to Nigeria, but this is because the props account is created with Local_ as Nigeria.
6. You can save this login details in case of subsequent authentication.

> [!TIP]
> You can log in with your own Spotify client ID.

**PS:** If you want to experience the app with your personal Spotify account, you can message me to add you to the beta users.

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

