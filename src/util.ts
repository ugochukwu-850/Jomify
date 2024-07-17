import { invoke } from "@tauri-apps/api";
import {
  JomoNavigation,
  DefaultObjectPage,
  Track,
  SimplifiedArtist,
  ArtistDetail,
  Album,
} from "./types";

/**
 *
 * @param page - The next page data attributes
 * Hello
 * @param nav - Global app nav state
 * @param setNav - Set global nav state dispatch function
 *
 * Creates a nextPage type for rendering the next page
 */
function nextPage(
  nav: JomoNavigation,
  setNav: React.Dispatch<React.SetStateAction<JomoNavigation>>,
  page?: DefaultObjectPage
) {
  // Create a new nav object
  let new_nav: JomoNavigation = {
    next: null,
    previous: nav,
    data: page ? page : nav.next ? nav.next.data : null,
    refresh: async function (): Promise<JomoNavigation> {
      return nav;
    },
  };

  // update the previous to hold this as its next
  let previous_nav: JomoNavigation = { ...nav, next: new_nav };

  // update the new_nav to have the updated previous nav
  new_nav.previous = previous_nav;

  // set the nav refresh function
  new_nav.refresh = REFRESH_ACTION

  setNav(new_nav);
}

const REFRESH_ACTION = async (
  nav: JomoNavigation
): Promise<JomoNavigation> => {
  const page = nav.data;

  const getTracks = async () => {
    try {
      if (page == null) {
        return nav;
      }
      console.log("Attempting to get tracks", page?.context);
      let [o_id, o_type] = [page?.header.id, page?.header.type];
      console.log("Running detail page view ", o_id, o_type);
      let context =
        page.header.type == "artist"
          ? await invoke<Album[]>("artist_albums", { id: o_id })
          : await invoke<Track[]>("get_tracks", {
              object: o_type,
              id: o_id,
            });
      let new_nav = {
        ...nav,
        data: {
          ...nav.data,
          context: context,
        } as DefaultObjectPage,
      } as JomoNavigation;

      return new_nav;
    } catch (error) {
      console.log(error);
      return nav
    }
  };
  return getTracks();
}

function previousPage(
  nav: JomoNavigation,
  setNav: React.Dispatch<React.SetStateAction<JomoNavigation>>
) {
  // set the current nav to previous
  let new_nav: JomoNavigation = {
    data: nav.previous ? nav.previous.data : nav.previous,
    next: nav,
    previous: nav.previous ? nav.previous.previous : nav.previous,
    refresh: async function (): Promise<JomoNavigation> {
      return nav;
    },
  };

  new_nav.refresh = REFRESH_ACTION

  setNav(new_nav);
}
/**
 * Converts a duration in milliseconds to a string formatted as MM:SS.
 *
 * @param {number} duration - The duration in milliseconds.
 * @returns {string} The formatted duration string.
 */
function formatDuration(duration: number): string {
  // Calculate total seconds from milliseconds
  const totalSeconds = Math.floor(duration / 1000);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format hours, minutes, and seconds with leading zero if necessary
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  if (hours > 0) {
    // Return formatted string with hours, minutes, and seconds
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    // Return formatted string with minutes and seconds
    return `${formattedMinutes}:${formattedSeconds}`;
  }
}
function formatHeadDuration(duration: number): string {
  // Calculate total seconds from milliseconds
  const totalSeconds = Math.floor(duration / 1000);

  // Calculate minutes and hours
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    // Return the formatted string for hours
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    // Return the formatted string for minutes
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
}

async function play_tracks(
  tracks: Track[],
  isadd: boolean,
  play_now: boolean
): Promise<void> {
  // send it to the backend play function
  try {
    console.log(tracks);
    let res: unknown = await invoke("add_to_queue", {
      play: play_now,
      add: isadd,
      tracks: tracks,
    });
  } catch (error) {
    console.log(error);
  }
}

async function generate_artist_page(
  id: string
): Promise<DefaultObjectPage | void> {
  try {
    let artist_detail: ArtistDetail = await invoke("artist_detail", { id: id });
    return { header: artist_detail } as DefaultObjectPage;
  } catch (error) {
    console.log(error);
  }
}

export {
  nextPage as default,
  previousPage,
  formatDuration,
  formatHeadDuration,
  play_tracks,
  generate_artist_page,
};
