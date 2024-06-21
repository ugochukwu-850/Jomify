interface SupportedAppsEndpoints {
    authorization_url: string;
    token_url: string;
    redirect_url: string;
    client_id: string;
}

enum SupportedApps {
    Spotify
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
    images: [{
        url: string;
    }];
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
  
  interface Artist {
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

