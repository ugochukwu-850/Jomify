interface SupportedAppsEndpoints {
  authorization_url: string;
  token_url: string;
  redirect_url: string;
  client_id: string;
}

enum SupportedApps {
  Spotify,
}
interface UserProfileData {
  display_name?: string | null;
  email?: string | null;
  country?: string | null;
  image_url: string;
  product: string;
  merchant_id: string;
}

interface SpotifyUser {
  country?: string | null;
  display_name?: string | null;
  email?: string | null;
  images: [
    {
      url: string;
    }
  ];
  product: string;
  id: string;
}

interface Equalizer {}

interface Settings {
  equalizer: Equalizer;
}

interface AuthCreds {
  access_token: string;
  refresh_token?: string | null;
  expires_at: number;
  token_type: string;
}

interface User {
  app: SupportedApps;
  settings: Settings;
  profile: UserProfileData;
}

// Home interfaces

export interface HomeResponse {
  gallery: DefaultObjectsPreview[];
  featured_playlists: DefaultObjectsPreview[];
  albums?: DefaultObjectsPreview[];
}

export interface DefaultObjectsPreview {
  name: string;
  description?: string;
  artist: Artist[];
  image: Image[];
  id: string;
  object_type: string;
  href: string;
  col?: number;
  row?: number;
  added_at?: string;
  released_at?: string;
}

export interface Artist {
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

interface Image {
  height?: number;
  url: string;
  width?: number;
}
export interface Album {
  album_type: string,
  artists: Artist[] | Artist,
  href: string,
  id: string,
  images: Image[],
  name: string,
  release_date: string,
  // pub release_date_precision: string,
  // total_tracks?: number,
  // pub type_: string,
  // uri: string,
}
export interface Track {
  name: string;
  duration_ms: number;
  isPlaying?: boolean;
  album?: Album,
  artists: Artist[];
  href: URL;
  id: string;
  popularity: number;
  object_type: string;

  play?: () => {};
}

export interface Page {
  header: DefaultObjectsPreview;
  tracks?: Track[];
  auto_play?: boolean,
}

export interface JomoNavigation {
  previous: null | JomoNavigation;
  next: null | JomoNavigation;
  data: Page | null
}


export interface PlayingAction {
  playing: boolean
}

export interface QueueSideMenuData {
  header: string,
  tracks: Track[]
}

export interface LyricsAndVideo {
  header: string
  video_src: string,
  lyrics: string[]
}
export interface RightSideMenu {
  open: boolean,
  context: QueueSideMenuData
}

export interface QueueMenuContext {
  data: RightSideMenu,
  setData: React.Dispatch<React.SetStateAction<RightSideMenu>>
}