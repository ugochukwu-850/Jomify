import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
  Typography,
  colors,
} from "@mui/material";
import homeTheme from "./theme";
import HomeSideMenu from "./menu/sidebar";
import MusicPlayer from "./menu/player";
import Main from "./menu/main";
import { createContext, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
  HomeResponse,
  Track,
  QueueMenuContext,
  QueueSideMenuData,
  RightSideMenu,
  JomoNavigation,
} from "../../types";
import { grey } from "@mui/material/colors";
import {
  Close,
  Help,
  LineStyleOutlined,
  ListAlt,
  ListOutlined,
  ListSharp,
  RemoveCircleOutlineOutlined,
  RemoveSharp,
} from "@mui/icons-material";
import { appWindow } from "@tauri-apps/api/window";
const RightSideMenuContext = createContext<null | QueueMenuContext>(null);

const Home = () => {
  console.log("Running Home effect");
  let [homeData, setHomeData] = useState<HomeResponse | null>(null);
  let [current_playing_track, setCurrentPlayingTrack] = useState<Track | null>(
    null
  );
  let [nav, setNav] = useState({
    previous: null,
    next: null,
    data: null,
  } as JomoNavigation);

  let page = nav.data;
  const [QueueMenu, setQueueMenu] = useState({
    open: false,
    context: { header: "Queue", tracks: [] } as QueueSideMenuData,
  } as RightSideMenu);

  useEffect(() => {
    let update_track = async () => {
      try {
        // listen for the curren_playing emittion
        const unlisten = await appWindow.listen<string>(
          "queue-changed",
          (event) => {
            let track = JSON.parse(event.payload) as Track[];
            if (track.length) {
              setQueueMenu({
                ...QueueMenu,
                context: { ...QueueMenu.context, tracks: track },
              });
            }
            console.log("Printing the event response", event.payload);
          }
        );
      } catch (error) {
        console.log(error);
      }
    };
    let update_now_playing = async () => {
      try {
        // listen for the curren_playing emittion
        const unlisten = await appWindow.listen<string>(
          "current-playing-changed",
          (event) => {
            let track = JSON.parse(event.payload) as Track;
            if (track.id) {
              setCurrentPlayingTrack(track);
            }
            console.log("Printing the event response", event.payload);
          }
        );
      } catch (error) {
        console.log(error);
      }
    };
    update_track();
    update_now_playing();
  }, []);

  useEffect(() => {
    let populate = async () => {
      try {
        console.log("Trying to get the main data");
        let data: HomeResponse = await invoke("home");
        setHomeData(data);
      } catch (error) {
        console.log(error);
      }
    };
    populate();
  }, []);

  return (
    <ThemeProvider theme={homeTheme}>
      <CssBaseline />
      <RightSideMenuContext.Provider
        value={{ data: QueueMenu, setData: setQueueMenu } as QueueMenuContext}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
            placeContent: "space-between",
            padding: "4px 0",
            height: "100vh",
            maxHeight: "100vh",
            minWidth: "800px",
          }}
        >
          <Grid
            container
            columns={20}
            sx={{
              padding: "8px 0",
              paddingRight: "8px",
              flex: "1",
              overflow: "hidden",
            }}
          >
            <Grid
              item
              xs={2}
              md={4}
              sx={{ overflow: "hidden", padding: "0 6px" }}
            >
              <HomeSideMenu />
            </Grid>
            <Grid
              item
              xs={QueueMenu.open ? 14 : 18}
              md={QueueMenu.open ? 12 : 16}
              height={"100%"}
              sx={{ overflow: "hidden" }}
            >
              <Main props={homeData} nav={nav} setNav={setNav} />
            </Grid>
            <Grid
              item
              xs={QueueMenu.open ? 4 : 0}
              display={QueueMenu.open ? "flex" : "none"}
              height={"100%"}
              sx={{
                background: "#121212",
                borderRadius: "12px",
                margin: "0 auto",
                flexDirection: "column",
                gap: ".2em",
                padding: "2px 12px",
                overflow: "hidden",
              }}
            >
              <AppBar
                elevation={0}
                position="sticky"
                sx={{
                  background: "transparent",
                  margin: "12px 4px",
                  display: "flex",
                  flexDirection: "row",
                  placeContent: "space-between",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {QueueMenu.context.header}
                </Typography>
                <IconButton
                  onClick={() => {
                    setQueueMenu({
                      ...QueueMenu,
                      open: !QueueMenu.open,
                    });
                  }}
                >
                  <Close />
                </IconButton>
              </AppBar>
              {QueueMenu.context.tracks.length || current_playing_track ? (
                <List
                  sx={{
                    overflow: "hidden",
                    overflowY: "scroll",
                    padding: "4px",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 900,
                      color: grey[500],
                      fontSize: "large",
                    }}
                  >
                    Now Playing
                  </Typography>
                  <ListItem
                    key={current_playing_track?.id}
                    sx={{
                      gap: "6px",
                      marginBottom: "24px",
                      padding: "2px 6px",
                      "& .MuiListItemIcon-root": {
                        display: "none",
                      },
                      "&:hover": {
                        background: colors.grey[900],
                        borderRadius: "6px",
                        transition: "ease-in .2s",
                        cursor: "pointer",
                        "& .MuiListItemIcon-root": {
                          display: "flex",
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        alt={current_playing_track?.name}
                        src={current_playing_track?.album?.images[0].url}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          sx={{ color: colors.green[600], fontWeight: 500 }}
                        >
                          {current_playing_track?.name}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          sx={{ color: colors.grey[600], fontWeight: 400 }}
                        >
                          {
                            <>
                              {current_playing_track?.artists.map((e, _) => (
                                <Link
                                  href={e.id}
                                  sx={{
                                    color: colors.grey[600],
                                    fontWeight: 400,
                                    margin: "auto 4px",
                                  }}
                                >
                                  {e.name}
                                </Link>
                              ))}
                            </>
                          }
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 900,
                      color: grey[500],
                      fontSize: "large",
                    }}
                  >
                    Upcoming
                  </Typography>
                  {QueueMenu.context.tracks.map((track, track_index) => (
                    <ListItem
                      key={track.id}
                      sx={{
                        gap: "6px",
                        margin: "4px 2px",
                        padding: "2px 6px",
                        "& .MuiListItemIcon-root": {
                          display: "none",
                        },
                        "&:hover": {
                          background: colors.grey[900],
                          borderRadius: "6px",
                          transition: "ease-in .2s",
                          cursor: "pointer",
                          "& .MuiListItemIcon-root": {
                            display: "flex",
                          },
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            borderRadius: "12px",
                            width: "48px",
                            height: "48px",
                          }}
                          alt="Remy Sharp"
                          src={track.album?.images[0].url}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            sx={{ color: colors.grey[400], fontWeight: 500 }}
                          >
                            {track.name}
                          </Typography>
                        }
                        secondary={track.artists.map((a, _) => (
                          <Link
                            href={a.id}
                            sx={{
                              color: colors.grey[600],
                              fontWeight: 400,
                              margin: "auto 4px",
                            }}
                          >
                            {a.name}
                          </Link>
                        ))}
                      />
                      <ListItemIcon
                        onClick={async () => {
                          // remove from the playlist
                          try {
                            let _: string = await invoke(
                              "remove_from_playlist",
                              { index: track_index }
                            );
                          } catch (error) {
                            console.log(error);
                          }
                        }}
                      >
                        <RemoveSharp fontSize="small" />
                      </ListItemIcon>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <>
                  <Typography
                    variant="h6"
                    sx={{ margin: "auto", color: colors.grey[400] }}
                  >
                    Nothing to Play
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
          <MusicPlayer />
        </Box>
      </RightSideMenuContext.Provider>
    </ThemeProvider>
  );
};

export { Home as default, RightSideMenuContext };
