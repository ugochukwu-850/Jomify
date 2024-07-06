import {
  Box,
  Card,
  CardMedia,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  colors,
  Link,
  Grid,
} from "@mui/material";
import { FC, useContext, useEffect, useState } from "react";
import {
  Album,
  DefaultObjectsPreview,
  JomoNavigation,
  DefaultObjectPage,
  Track,
  ArtistDetail,
} from "../../../types";
import {
  DownloadDoneOutlined,
  DownloadDoneRounded,
  DownloadOutlined,
  DownloadRounded,
  DownloadingOutlined,
  ImportContacts,
  PlayArrow,
  PlayCircleFilledOutlined,
  PlaylistAdd,
  PunchClock,
  ViewAgendaSharp,
  ViewListOutlined,
} from "@mui/icons-material";
import SpotifyIcon from "../../../assets/spotify.svg";
import nextPage, {
  formatDuration,
  formatHeadDuration,
  generate_artist_page,
  play_tracks,
} from "../../../util";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { JomoNavigationContext } from "..";
interface PageProps {
  page: DefaultObjectPage;
}

const DetailPageView: FC<PageProps> = ({ page }) => {
  let nav_context = useContext(JomoNavigationContext);
  if (nav_context) {
    nav_context;
  } else {
    console.log("Navigating iweudhiweudwed");
    return <></>;
  }
  let { nav, setNav } = nav_context;
  let [totalDownloaded, setTotalDownloaded] = useState(0);
  let [total_items, setTotalItems] = useState(0);
  let [downloading, setDownloading] = useState(false);
  let [download_complete, setDownloadComplete] = useState(false);

  useEffect(() => {
    console.log("Running get tracks effect");
    const getTracks = async () => {
      try {
        console.log("Attempting to get tracks", page?.context);
        if (!page?.context?.length) {
          let [o_id, o_type] = [page?.header.id, page?.header.type];
          console.log("Running detail page view ", o_id, o_type);
          let context =
            page.header.type == "artist"
              ? await invoke<Album[]>("artist_albums", { id: o_id })
              : await invoke<Track[]>("get_tracks", {
                  object: o_type,
                  id: o_id,
                });
          setTotalItems(context.length);
          setNav({
            ...nav,
            data: {
              ...nav.data,
              context: context,
            } as DefaultObjectPage,
          });

          return;
        }

        return;
      } catch (error) {
        console.log(error);
      }
    };
    // function to check downloaded
    const isDonwloaded = async () => {
      console.log("Trying to check if the tracks have been downloaded");
      try {
        if (page?.context?.length) {
          await invoke("is_downloaded", { tracks: page?.context });
          return;
        }
      } catch (error) {
        console.log(error);
      }
    };
    getTracks();
    isDonwloaded();
  }, [page]);

  useEffect(() => {
    // if total downloaded changes check to set download or not

    function manage_donwload_status() {
      if (total_items == totalDownloaded) {
        setDownloadComplete(true);
        setDownloading(false);
      } else {
        setDownloadComplete(false);
        if (totalDownloaded != 0) {
          setDownloading(true);
        }
      }
    }
    manage_donwload_status();
  }, [totalDownloaded, total_items]);
  if (page.header.type == "artist") {
    return (
      <ArtistDetailDisplayView
        header={page.header as ArtistDetail}
        albums={page.context as Album[]}
      />
    );
  } else {
    return (
      <ObjectDisplayView
        header={page.header as DefaultObjectsPreview}
        tracks={page.context as Track[]}
      />
    );
  }
};

interface ObjectDisplayViewProps {
  header: DefaultObjectsPreview;
  tracks?: Track[];
}
interface ArtistDisplayViewProps {
  header: ArtistDetail;
  albums?: Album[];
}

const ObjectDisplayView: FC<ObjectDisplayViewProps> = ({ header, tracks }) => {
  let nav_context = useContext(JomoNavigationContext);
  if (nav_context) {
    nav_context;
  } else {
    return <></>;
  }
  let { nav, setNav } = nav_context;
  let [totalDownloaded, setTotalDownloaded] = useState(0);
  let [total_items, setTotalItems] = useState(0);
  let [downloading, setDownloading] = useState(false);
  let [download_complete, setDownloadComplete] = useState(false);

  return (
    <Box>
      {/* Header displayer */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          placeContent: "baseline",
          gap: "2em",

          background: "transparent",
        }}
      >
        <CardMedia
          component={"img"}
          image={
            header.image
              ? header.image[0].url
              : "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228"
          }
          sx={{ width: "240px", borderRadius: "12px" }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: ".2em",
            placeContent: "baseline",
            margin: "auto 0",
          }}
        >
          <Typography variant="body2">{header.type}</Typography>
          <Typography variant="h2">{header.name}</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, color: "grey" }}>
            {header.description}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <SpotifyIcon />
            <Typography
              variant="body2"
              sx={{ textAlign: "baseline", margin: "auto 12px" }}
            >
              {"Created By "}
              {header.artist.map((e, i) => {
                console.log(e.name);
                return (
                  <Link
                    onClick={async (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      let artist_page = await generate_artist_page(e.id);
                      if (artist_page) {
                        nextPage(nav, setNav, artist_page);
                      }
                    }}
                    href={e.uri}
                  >
                    {e.name}
                  </Link>
                );
              })}
            </Typography>
            <Typography variant="body1">
              {tracks ? `${tracks?.length} songs` : ""}
            </Typography>
            {
              <Typography
                variant="body2"
                sx={{ textAlign: "center", margin: "auto 6px" }}
              >
                About{" "}
                {formatDuration(
                  Math.floor(
                    tracks
                      ? tracks.reduce((total, track) => {
                          return total + track.duration_ms;
                        }, 0)
                      : 0
                  )
                )}
              </Typography>
            }
          </Box>
        </Box>
      </Box>
      {/*Tracks Control*/}
      <Box sx={{ margin: "12px 0" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <IconButton>
              <PlayCircleFilledOutlined
                sx={{
                  fontSize: "56px",
                  "& :hover": { background: "green", cursor: "pointer" },
                }}
                onClick={async () => {
                  console.log("Clicked");
                  tracks
                    ? await play_tracks(
                        tracks.map((track, _) => {
                          return {
                            ...track,
                            album: !track.album
                              ? ({
                                  type: header.type,
                                  artists: header.artist,
                                  href: header.href,
                                  id: header.id,
                                  images: header.image,
                                  name: header.name,
                                  release_date: header.released_at,
                                } as Album)
                              : track.album,
                          } as Track;
                        }),
                        false,
                        false
                      )
                    : false;
                }}
              />
            </IconButton>
            <IconButton
              onClick={async () => {
                console.log("Clicked");
                tracks
                  ? await play_tracks(
                      tracks.map((track, _) => {
                        return {
                          ...track,
                          album: !track.album
                            ? ({
                                type: header.type,
                                artists: header.artist,
                                href: header.href,
                                id: header.id,
                                images: header.image,
                                name: header.name,
                                release_date: header.released_at,
                              } as Album)
                            : track.album,
                        } as Track;
                      }),
                      true,
                      false
                    )
                  : false;
              }}
            >
              <PlaylistAdd />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            {download_complete ? (
              <IconButton sx={{ height: "max-content" }}>
                <DownloadDoneRounded sx={{ fontSize: "12px" }} />
              </IconButton>
            ) : (
              <Typography variant="body1" sx={{ fontSize: "12px" }}>
                {totalDownloaded}/{total_items}
              </Typography>
            )}
            <IconButton
              sx={{
                height: "max-content",
                display: downloading ? "none" : "flex",
              }}
              onClick={async () => {
                try {
                  await invoke("download", { tracks: tracks });
                } catch (error) {
                  console.log(error);
                }
              }}
            >
              {downloading ? <DownloadingOutlined /> : <DownloadOutlined />}
            </IconButton>
          </Box>
        </Box>
        <TableContainer
          sx={{
            width: "100%",
            maxHeight: "64vh",
            margin: "0 auto",
          }}
        >
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell key="#" align="left" style={{ minWidth: 5 }}>
                  <Typography>#</Typography>
                </TableCell>
                <TableCell key="1header" align="left" style={{ minWidth: 100 }}>
                  <Typography>Title</Typography>
                </TableCell>
                <TableCell key="2header" align="left" style={{ minWidth: 100 }}>
                  <Typography>Album</Typography>
                </TableCell>
                <TableCell key="3header" align="left" style={{ minWidth: 100 }}>
                  <Typography>Date Added</Typography>
                </TableCell>
                <TableCell key="4header" align="left" style={{ minWidth: 100 }}>
                  <PunchClock />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tracks?.map((track, index) => {
                return (
                  <TrackListItem
                    track={track}
                    index={index}
                    header={header}
                    setDownloadedItem={setTotalDownloaded}
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

const ArtistDetailDisplayView: FC<ArtistDisplayViewProps> = ({
  header,
  albums,
}) => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          placeContent: "baseline",
          gap: "2em",

          background: "transparent",
        }}
      >
        <CardMedia
          component={"img"}
          image={
            header.images
              ? header.images[0].url
              : "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228"
          }
          sx={{ width: "240px", borderRadius: "12px" }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: ".2em",
            placeContent: "baseline",
            margin: "auto 0",
          }}
        >
          <Typography variant="body2">{header.type}</Typography>
          <Typography variant="h2">{header.name}</Typography>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <SpotifyIcon />
            {header.genres.map((genre, i) => {
              return (
                <Link sx={{ margin: "auto 2px" }} key={i}>
                  {genre}
                </Link>
              );
            })}
          </Box>
          <Typography variant="body1" sx={{ color: "greenyellow" }}>
            Followers {header.followers.total > 1000 ? Math.round(Math.floor(header.followers.total)/1000) : header.followers.total}k
          </Typography>
        </Box>
      </Box>
      {/**Album List view */}
      <Grid container columns={18} justifyContent={"space-evenly"} gap={".5rem"} sx={{margin: "24px 6px"}}>
        {albums?.map(
          (
            { type: album_type, artists, href, id, images, release_date, name },
            index
          ) => (
            <Grid item xs={8} md={4}>
              <AlbumComponent
                type={album_type}
                artists={artists}
                href={href}
                id={id}
                images={images}
                name={name}
                release_date={release_date}
              />
            </Grid>
          )
        )}
      </Grid>
    </Box>
  );
};

const AlbumComponent: FC<Album> = (album) => {
  let nav_context = useContext(JomoNavigationContext);
  if (nav_context) {
    nav_context;
  } else {
    return <></>;
  }
  let { nav, setNav } = nav_context;
  let page = {
    header: {
      artist: album.artists,
      href: album.href,
      id: album.id,
      type: album.type,
      image: album.images,
      name: album.name,
      released_at: album.release_date,
    } as DefaultObjectsPreview,
  } as DefaultObjectPage;
  return (
    <Box
    sx={{width: "100%", height: "100%", minHeight: "250px", "&: hover": {background: "rgba(122, 125, 125, .1)", borderRadius: "6px", cursor: "pointer"}}}
      onClick={async () => {
        // onclick create new page with the header and no tracks
        nextPage(nav, setNav, { ...page, auto_play: false });
      }}
    >
      <CardMedia
        image={album.images[0].url}
        
        sx={{minHeight: "200px", borderRadius: "6px" }}
      >
        <IconButton
          onClick={async () => {
            // onclick create new page with the header and no tracks
            nextPage(nav, setNav, { ...page, auto_play: true });
          }}
        >
          <PlayCircleFilledOutlined sx={{ fontSize: "48px" }} />
        </IconButton>
      </CardMedia>
      <Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: "700", color: colors.grey[500] }}
        >
          {album.name}
        </Typography>
        <Typography
          variant="body1"
          sx={{ fontWeight: "500", color: colors.grey[700] }}
        >
          {album.release_date}
        </Typography>
      </Box>
    </Box>
  );
};
interface TVC {
  track: Track;
  index: number;
  header: DefaultObjectsPreview;
  setDownloadedItem: React.Dispatch<React.SetStateAction<number>>;
}
const TrackListItem: FC<TVC> = ({
  index,
  track,
  header,
  setDownloadedItem,
}) => {
  let [downloaded, setDownload] = useState(false);
  let nav_context = useContext(JomoNavigationContext);
  if (nav_context) {
    nav_context;
  } else {
    return <></>;
  }
  let { nav, setNav } = nav_context;
  useEffect(() => {
    let listen_if_downloaded = async () => {
      try {
        console.log("Attempting to listen for if I am downloaded");
        let unlisten = await appWindow.listen(
          `downloaded-${track.id}`,
          (event) => {
            console.log(event.payload, track.id);
            setDownload(true);
            setDownloadedItem((prev) => prev + 1);
          }
        );
        unlisten();
      } catch (error) {
        console.log(error);
      }
    };
    listen_if_downloaded();
  }, []);

  return (
    <TableRow
      sx={{
        "&:hover": { cursor: "pointer" },
        "& .MuiTableRow-root :hover": { background: "grey" },
      }}
      key={track.id}
    >
      <TableCell
        onClick={async () => {
          await play_tracks(
            [
              {
                ...track,
                album: !track.album
                  ? ({
                      type: header.type,
                      artists: header.artist,
                      href: header.href,
                      id: header.id,
                      images: header.image,
                      name: header.name,
                      release_date: header.released_at,
                    } as Album)
                  : track.album,
              } as Track,
            ],
            true,
            true
          );
        }}
      >
        {downloaded ? <DownloadDoneOutlined /> : <PlayArrow />}
      </TableCell>
      <TableCell
        sx={{
          display: "flex",
          justifyContent: "start",
          gap: ".5em",
          minWidth: 100,
        }}
        style={{ minWidth: 100 }}
      >
        <Card sx={{ background: "transparent" }} elevation={0}>
          <CardMedia
            loading="lazy"
            component={"img"}
            sx={{ width: "48px", rowGap: ".5em" }}
            image={
              track.album ? track.album.images[0].url : header.image[0].url
            }
          />
        </Card>
        <Box>
          <Typography>{track.name}</Typography>
          <Typography variant="body1">
            {track.artists.map((e, i) => {
              return (
                <Link
                  onClick={async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    let artist_page = await generate_artist_page(e.id);
                    if (artist_page) {
                      nextPage(nav, setNav, artist_page);
                    }
                  }}
                  sx={{
                    color: colors.grey[700],
                    fontWeight: "500",
                    margin: "auto 4px",
                  }}
                  href={e.href}
                >
                  {e.name}
                </Link>
              );
            })}
          </Typography>
        </Box>
      </TableCell>
      <TableCell style={{ minWidth: 100 }}>
        <Typography
          sx={{
            color: "grey",
            fontWeight: "500",
            "& :hover": { textDecoration: "underline" },
          }}
          onClick={async () => {
            // set a page data from the album info and the set the page
            if (track.album) {
              let page = {
                header: {
                  artist: track.album.artists,
                  href: track.album.href,
                  id: track.album.id,
                  image: track.album.images,
                  name: track.album.name,
                  type: track.album.type,
                  released_at: track.album.release_date,
                } as DefaultObjectsPreview,
              } as DefaultObjectPage;

              // call next page on the item
              nextPage(nav, setNav, page);
            }
          }}
        >
          {track.album ? track.album.name : header.name}
        </Typography>
      </TableCell>
      <TableCell style={{ minWidth: 100 }}>
        <Typography sx={{ color: "grey", fontWeight: "500" }}>
          {track.album
            ? track.album.release_date
            : header.released_at
            ? header.released_at
            : new Date().toLocaleTimeString()}
        </Typography>
      </TableCell>
      <TableCell style={{ minWidth: 100 }}>
        <Typography sx={{ color: "grey", fontWeight: "500" }}>
          {formatDuration(track.duration_ms)}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

export default DetailPageView;
