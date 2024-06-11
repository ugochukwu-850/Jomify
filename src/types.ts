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
