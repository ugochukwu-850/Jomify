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
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import {
  Album,
  DefaultObjectsPreview,
  JomoNavigation,
  Page,
  Track,
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
  play_tracks,
} from "../../../util";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
interface PageProps {
  nav: JomoNavigation;
  setNav: React.Dispatch<React.SetStateAction<JomoNavigation>>;
}

const DetailPageView: FC<PageProps> = ({ nav, setNav }) => {
  let [totalDownloaded, setTotalDownloaded] = useState(0);
  let [total_items, setTotalItems] = useState(0);
  let [downloading, setDownloading] = useState(false);
  let [download_complete, setDownloadComplete] = useState(false);

  let { data, next, previous } = nav;
  let page = data;
  useEffect(() => {
    console.log("Running get tracks effect");
    const getTracks = async () => {
      try {
        console.log("Attempting to get tracks", page?.tracks);
        if (!page?.tracks?.length) {
          let [o_id, o_type] = [page?.header.id, page?.header.object_type];
          console.log("Running detail page view ", o_id, o_type);
          let tracks: Track[] = await invoke("get_tracks", {
            object: o_type,
            id: o_id,
          });
          setTotalItems(tracks.length);
          setNav({
            ...nav,
            data: {
              ...data,
              tracks,
            } as Page,
          });

          return
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
        if (page?.tracks?.length) {
          await invoke("is_downloaded", { tracks: page?.tracks });
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
    function loop_back() {
      if (totalDownloaded) {
        setTotalDownloaded((prev) => prev % total_items)
      };
    }
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
    loop_back();
    manage_donwload_status();
  }, [totalDownloaded, total_items]);
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
          image={page?.header.image[0].url}
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
          <Typography variant="body2">{page?.header.object_type}</Typography>
          <Typography variant="h2">{page?.header.name}</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, color: "grey" }}>
            {page?.header.description}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <SpotifyIcon />
            <Typography
              variant="body2"
              sx={{ textAlign: "baseline", margin: "auto 12px" }}
            >
              {"Created By "}
              {page?.header.artist.map((e, i) => {
                console.log(e.name);
                return <Link href={e.uri}>{e.name}</Link>;
              })}
            </Typography>
            <Typography variant="body1">
              {page?.tracks ? `${page?.tracks?.length} songs` : ""}
            </Typography>
            {
              <Typography
                variant="body2"
                sx={{ textAlign: "center", margin: "auto 6px" }}
              >
                About{" "}
                {formatDuration(
                  Math.floor(
                    page?.tracks
                      ? page.tracks.reduce((total, track) => {
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
                  page?.tracks
                    ? await play_tracks(
                        page.tracks.map((track, _) => {
                          return {
                            ...track,
                            album: !track.album
                              ? ({
                                  album_type: page.header.object_type,
                                  artists: page.header.artist,
                                  href: page.header.href,
                                  id: page.header.id,
                                  images: page.header.image,
                                  name: page.header.name,
                                  release_date: page.header.released_at,
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
                page?.tracks
                  ? await play_tracks(
                      page.tracks.map((track, _) => {
                        return {
                          ...track,
                          album: !track.album
                            ? ({
                                album_type: page.header.object_type,
                                artists: page.header.artist,
                                href: page.header.href,
                                id: page.header.id,
                                images: page.header.image,
                                name: page.header.name,
                                release_date: page.header.released_at,
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
                  await invoke("download", { tracks: page?.tracks });
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
              {page?.tracks?.map((track, index) => {
                return (
                  <TrackListItem
                    track={track}
                    index={index}
                    header={page.header}
                    setDownloadedItem={setTotalDownloaded}
                    setNav={setNav}
                    nav={nav}
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

interface TVC {
  track: Track;
  index: number;
  header: DefaultObjectsPreview;
  setDownloadedItem: React.Dispatch<React.SetStateAction<number>>,
  setNav: React.Dispatch<React.SetStateAction<JomoNavigation>>,
  nav: JomoNavigation,
}
const TrackListItem: FC<TVC> = ({
  index,
  track,
  header,
  setDownloadedItem,
  setNav,
  nav,
}) => {
  let [downloaded, setDownload] = useState(false);

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
                      album_type: header.object_type,
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
        {downloaded? <DownloadDoneOutlined/> : <PlayArrow />}
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
                  object_type: track.album.album_type,
                  released_at: track.album.release_date,
                } as DefaultObjectsPreview,
              } as Page;

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
