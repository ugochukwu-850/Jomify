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
  artist: SimplifiedArtist[];
  image: Image[];
  id: string;
  type: string;
  href: string;
  col?: number;
  row?: number;
  added_at?: string;
  released_at?: string;
}

export interface SimplifiedArtist {
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
  type: string,
  artists: SimplifiedArtist[] | SimplifiedArtist,
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
  artists: SimplifiedArtist[];
  href: URL;
  id: string;
  popularity: number;
  type: string;

  play?: () => {};
}

export interface DefaultObjectPage {
  header: DefaultObjectsPreview | ArtistDetail;
  context?: Track[] | Album[];
  auto_play?: boolean,
}


export interface ArtistDetail extends SimplifiedArtist {
  id: string,
  name: string;
  images: Image[];
  type: string,
  popularity: number,
  genres: string[],
  followers: Followers,
}

interface Followers {
  href?: string,
  total: number
}

export interface JomoNavigation {
  refresh(new_nav: JomoNavigation): Promise<JomoNavigation>;
  previous: null | JomoNavigation;
  next: null | JomoNavigation;
  data: DefaultObjectPage | null
}

export interface GlobalStateContext {
  logged_in: boolean,
  user_info?: User
} 

export interface GlobalStateContextController {
  setGlobalState: React.Dispatch<React.SetStateAction<GlobalStateContext>>,
  global_state: GlobalStateContext,
}

export interface JomoNavigationContextShape {
  setNav: React.Dispatch<React.SetStateAction<JomoNavigation>>,
  nav: JomoNavigation,
  queue_tab_visible: boolean,
  setQueueVisible: React.Dispatch<React.SetStateAction<boolean>>
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

export interface SearchResult {
  tracks: SearchResultTracks,
  albums: SearchResultAlbums,
  artists: SearchResultArtists
}

interface SearchResultAlbums {
  items: Album[]
}

export interface SearchResultArtists {
  items: ArtistDetail[]
}

export interface SearchResultTracks {
  items: Track[]
}