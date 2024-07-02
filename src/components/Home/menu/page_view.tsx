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
import { Album, JomoNavigation, Page, Track } from "../../../types";
import {
  ImportContacts,
  PlayArrow,
  PlayCircleFilledOutlined,
  PlaylistAdd,
  PunchClock,
  ViewAgendaSharp,
  ViewListOutlined,
} from "@mui/icons-material";
import SpotifyIcon from "../../../assets/spotify.svg";
import { formatDuration, formatHeadDuration, play_tracks } from "../../../util";
import { invoke } from "@tauri-apps/api/tauri";
interface PageProps {
  nav: JomoNavigation;
  setNav: React.Dispatch<React.SetStateAction<JomoNavigation>>;
}

const DetailPageView: FC<PageProps> = ({ nav, setNav }) => {
  let { data, next, previous } = nav;
  let page = data;
  useEffect(() => {
    const getTracks = async () => {
      try {
        if (!data?.tracks) {
          let [o_id, o_type] = [page?.header.id, page?.header.object_type];
          console.log("Running detail page view ", o_id, o_type);
          let tracks: Track[] = await invoke("get_tracks", {
            object: o_type,
            id: o_id,
          });
          setNav({
            ...nav,
            data: {
              ...data,
              tracks,
            } as Page,
          });
        }
        return;
      } catch (error) {
        console.log(error);
      }
    };
    getTracks();
  }, []);
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
          <IconButton sx={{ height: "max-content" }}>
            <ViewListOutlined />
          </IconButton>
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
                  <TableRow
                    sx={{
                      "&:hover": { cursor: "pointer" },
                      "& .MuiTableRow-root :hover": { background: "grey" },
                    }}
                    onClick={async () => {
                      await play_tracks(
                        [
                          {
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
                          } as Track,
                        ],
                        true,
                        true
                      );
                    }}
                    key={index}
                  >
                    <HoverableTableCell count={index + 1} />
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
                            track.album
                              ? track.album.images[0].url
                              : page.header.image[0].url
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
                      <Typography sx={{ color: "grey", fontWeight: "500" }}>
                        {track.album ? track.album.name : page.header.name}
                      </Typography>
                    </TableCell>
                    <TableCell style={{ minWidth: 100 }}>
                      <Typography sx={{ color: "grey", fontWeight: "500" }}>
                        {track.album
                          ? track.album.release_date
                          : page.header.released_at
                          ? page.header.released_at
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
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};
interface HVC {
  count: number;
}
const HoverableTableCell: FC<HVC> = ({ count }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <TableCell
      style={{ width: "20px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered ? <PlayArrow /> : count}
    </TableCell>
  );
};

export default DetailPageView;
