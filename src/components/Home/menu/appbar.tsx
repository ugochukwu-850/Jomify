import {
  ArrowBackIosOutlined,
  ArrowForwardIosOutlined,
  Cancel,
  PaymentOutlined,
  PersonOutlineOutlined,
  SearchRounded,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  CardMedia,
  colors,
  Grid,
  IconButton,
  InputAdornment,
  TableContainer,
  Typography,
} from "@mui/material";
import { JomoAppSearch } from "../theme";
import styles from "../index.module.scss";
import { FC, useContext, useEffect, useState } from "react";
import {
  JomoNavigation,
  DefaultObjectPage,
  Track,
  Album,
  SearchResult,
  SearchResultTracks,
  SearchResultArtists,
} from "../../../types";
import nextPage, { generate_artist_page, previousPage } from "../../../util";
import { Artist } from "@spotify/web-api-ts-sdk";
import { invoke } from "@tauri-apps/api";
import { AlbumComponent, TrackTableView } from "./page_view";
import { JomoNavigationContext } from "..";

interface ModelProps {
  setNav: React.Dispatch<React.SetStateAction<JomoNavigation>>;
  nav: JomoNavigation;
}

const JomoAppBar: FC<ModelProps> = ({ nav, setNav }) => {
  let [search_view, setSearchView] = useState<"tracks" | "artist" | "album">(
    "tracks"
  );
  let [search_query, setSearchQuery] = useState("");
  let [search_result_view, setResultViewOpen] = useState(false);
  let [search_result, setSearchResult] = useState<SearchResult | null>(null);
  let [loading, setLoading] = useState(false);
  useEffect(() => {}, [search_query]);
  return (
    <AppBar
      elevation={0}
      position="relative"
      sx={{ background: "transparent" }}
    >
      <Grid container columns={16} sx={{ margin: "0", padding: "4px 12px" }}>
        <Grid
          item
          xs={2}
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: ".2em",
            margin: "auto",
          }}
        >
          <IconButton
            className={styles.headerIconButton}
            onClick={() => {
              previousPage(nav, setNav);
            }}
            disabled={nav.previous ? false : true}
          >
            <ArrowBackIosOutlined className={styles.headerIcon} />
          </IconButton>
          <IconButton
            className={styles.headerIconButton}
            onClick={() => {
              nextPage(nav, setNav);
            }}
            disabled={nav.next ? false : true}
          >
            <ArrowForwardIosOutlined className={styles.headerIcon} />
          </IconButton>
        </Grid>
        <Grid item xs={8} sx={{ padding: "2px 12px" }}>
          <JomoAppSearch
            disabled={loading ? true : false}
            variant="outlined"
            placeholder="Search"
            sx={{
              minWidth: "200px",
              width: "60%",
              "&:hover": { cursor: "pointer" },
            }}
            autoComplete="off"
            onSubmit={async (e) => {
              e.preventDefault();
              // send the current search to the backend and wait for response
              setLoading(true);
              try {
                let search_result = await invoke<SearchResult>(
                  "search_command",
                  {
                    q: search_query,
                  }
                );
                setLoading(false);
                setSearchResult(search_result);
              } catch (error) {
                console.log(error);
              }
            }}
            onFocus={(e) => {
              setResultViewOpen(true);
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment
                  sx={{ "& :hover": { cursor: "pointer" } }}
                  onClick={async (e) => {
                    e.preventDefault();
                    // send the current search to the backend and wait for response
                    setLoading(true);
                    try {
                      let search_result = await invoke<SearchResult>(
                        "search_command",
                        {
                          q: search_query,
                        }
                      );
                      setLoading(false);
                      setSearchResult(search_result);
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  position="start"
                >
                  <SearchRounded />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid
          item
          sx={{
            margin: "auto",
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            placeContent: "end",
            gap: "24px",
          }}
          xs={6}
        >
          <Typography className={styles.licenseStk} variant="body1">
            Spotify
          </Typography>
          <IconButton className={styles.headerIconButton}>
            <PersonOutlineOutlined className={styles.headerIcon} />
          </IconButton>
          <IconButton className={styles.headerIconButton}>
            <PaymentOutlined className={styles.headerIcon} />
          </IconButton>
        </Grid>
      </Grid>
      <Box
        display={search_result_view ? "block" : "none"}
        sx={{ height: "90vh" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: "1rem",
            placeContent: "space-between",
            margin: "24px 0",
          }}
        >
          <Box>
            <Button
              sx={{ borderRadius: "18px", margin: "2px 4px" }}
              variant={search_view == "tracks" ? "outlined" : "text"}
              onClick={() => {
                setSearchView("tracks");
              }}
            >
              Tracks
            </Button>
            <Button
              sx={{ borderRadius: "18px", margin: "2px 4px" }}
              variant={search_view == "artist" ? "outlined" : "text"}
              onClick={() => {
                setSearchView("artist");
              }}
            >
              Artists
            </Button>
            <Button
              sx={{ borderRadius: "18px", margin: "2px 4px" }}
              variant={search_view == "album" ? "outlined" : "text"}
              onClick={() => {
                setSearchView("album");
              }}
            >
              Albums
            </Button>
          </Box>
          <IconButton
            sx={{ maxHeight: "max-content" }}
            onClick={() => {
              setResultViewOpen(false);
            }}
          >
            <Cancel />
          </IconButton>
        </Box>
        <Box
          onClick={() => {
            if (search_view != "tracks") {
              setResultViewOpen(false);
            }
          }}
          sx={{ marginTop: "24px" }}
        >
          {search_view == "tracks" ? (
            search_result ? (
              <SearchTrackComponent items={search_result.tracks.items} />
            ) : (
              <></>
            )
          ) : search_view == "album" ? (
            <Grid
              container
              columns={18}
              justifyContent={"space-evenly"}
              gap={".5rem"}
              rowGap={"1rem"}
              sx={{ margin: "24px 6px", overflowY: "scroll", height: "600px" }}
            >
              {search_result?.albums.items.map((album, index) => (
                <Grid item xs={8} md={4}>
                  <AlbumComponent
                    type={album.type}
                    artists={album.artists}
                    href={album.href}
                    id={album.id}
                    images={album.images}
                    name={album.name}
                    release_date={album.release_date}
                  />
                </Grid>
              ))}
            </Grid>
          ) : search_result ? (
            // for artists
            <ArtistBulbView items={search_result.artists.items} />
          ) : (
            <></>
          )}
        </Box>
      </Box>
    </AppBar>
  );
};

const SearchTrackComponent: FC<SearchResultTracks> = ({ items }) => {
  let [downloaded, setDownloaded] = useState(0);

  return (
    <TableContainer
      sx={{
        width: "100%",
        maxHeight: "64vh",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <TrackTableView
        setDownloaded={setDownloaded}
        header={undefined}
        tracks={items}
      />
    </TableContainer>
  );
};

const ArtistBulbView: FC<SearchResultArtists> = ({ items }) => {
  let nav_context = useContext(JomoNavigationContext);
  if (nav_context) {
    nav_context;
  } else {
    return <></>;
  }
  let { nav, setNav } = nav_context;

  return (
    <Grid
      container
      columns={18}
      justifyContent={"space-evenly"}
      gap={".5rem"}
      rowGap={"1rem"}
      sx={{ margin: "24px 6px", overflowY: "scroll", height: "600px" }}
    >
      {items.map((artist, index) => {
        return (
          <Grid item xs={8} md={4}>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                minHeight: "250px",
                padding: "4px",
                "&: hover": {
                  background: "rgba(122, 125, 125, .1)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "ease-in-out .2s",
                  "& .MuiCardMedia-root": { borderRadius: "12px" },
                },
              }}
              onClick={async (event) => {
                event.preventDefault();
                console.log(artist.id);
                let artist_page = await generate_artist_page(artist.id);
                if (artist_page) {
                  nextPage(nav, setNav, artist_page);
                }
              }}
            >
              <CardMedia
                image={
                  artist.images.length > 0
                    ? artist.images[0].url
                    : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                }
                sx={{ minHeight: "200px", borderRadius: "6px" }}
              ></CardMedia>
              <Box sx={{ padding: "4px" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "700",
                    fontSize: "18px",
                    color: colors.grey[500],
                  }}
                >
                  {artist.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "500", color: colors.deepOrange[900] }}
                >
                  Followers{" "}
                  {Math.round(Math.floor(artist.followers.total) / 1000)} k
                </Typography>
              </Box>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
};
export default JomoAppBar;
