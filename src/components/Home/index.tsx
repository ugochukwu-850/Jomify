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
import { createContext, useContext, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  HomeResponse,
  Track,
  QueueMenuContext,
  QueueSideMenuData,
  RightSideMenu,
  JomoNavigation,
  JomoNavigationContextShape,
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
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import nextPage, { generate_artist_page, play_tracks } from "../../util";
import { GlobalState } from "../../App";
import AuthPage from "../AuthHome/main";
const appWindow = getCurrentWebviewWindow()
// const RightSideMenuContext = createContext<null | QueueMenuContext>(null);
const JomoNavigationContext = createContext<
  JomoNavigationContextShape | undefined
>(undefined);

const Home = () => {
  console.log("Running Home effect");
  let [homeData, setHomeData] = useState<HomeResponse | undefined>(undefined);
  let [nav, setNav] = useState({
    previous: null,
    next: null,
    data: null,
  } as JomoNavigation);
  let [queue_visible, setQueueVisible] = useState(true);
  let [refresh, setRefresh] = useState(0);
  let app_state = useContext(GlobalState);

  if (app_state == undefined) {
    return <></>;
  }
  let { global_state } = app_state;
  document.addEventListener("keydown", function (event) {
    if (
      (((event.ctrlKey || event.metaKey) && event.key === "r") ||
        event.key === "F5") &&
      !nav.data
    ) {
      event.preventDefault();
      event.stopPropagation();
      console.log("Refresh prevented (Ctrl+R or Cmd+R)");
      setRefresh((prev) => prev + 1);
    }
  });

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
    let run = async () => {
      if (nav.data == null) {
        populate();
      } else {
        // nav.populate
        let refreshed = await nav.refresh(nav);
        setNav(refreshed);
      }
    };
    run();
  }, [refresh, global_state.logged_in]);

  return (
    <ThemeProvider theme={homeTheme}>
      <CssBaseline />
      <JomoNavigationContext.Provider
        value={{
          nav: nav,
          setNav: setNav,
          queue_tab_visible: queue_visible,
          setQueueVisible: setQueueVisible,
        }}
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
              xs={queue_visible ? 14 : 18}
              md={queue_visible ? 12 : 16}
              height={"100%"}
              sx={{ overflow: "hidden" }}
            >
              <Main props={homeData} />
            </Grid>
            <QueueComponent />
          </Grid>
          <MusicPlayer />
        </Box>
      </JomoNavigationContext.Provider>
    </ThemeProvider>
  );
};

const QueueComponent = () => {
  let nav_context = useContext(JomoNavigationContext);
  if (nav_context) {
    nav_context;
  } else {
    return <></>;
  }
  let { nav, setNav, queue_tab_visible, setQueueVisible } = nav_context;
  let [queue_tracks, setQueueTracks] = useState<undefined | Track[]>(undefined);
  let [head, setHead] = useState<undefined | Track>(undefined);

  useEffect(() => {
    let update_track = async () => {
      try {
        // listen for the curren_playing emittion
        const unlisten = await appWindow.listen<string>(
          "queue-changed",
          (event) => {
            let track = JSON.parse(event.payload) as Track[];
            if (track.length) {
              setQueueTracks(track);
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
              setHead(track);
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
    // handle the auto updating of queue
    const refresh_queue = async () => {
      try {
        console.log("Attempting to get queue");
        let queue_tracks = await invoke<Track[]>("get_queue");
        console.log(queue_tracks);
        setQueueTracks(queue_tracks);
      } catch (error) {
        console.log(error);
      }
    };
    const refresh_head = async () => {
      try {
        console.log("Attempting to get queue");
        let head_track = await invoke<Track>("get_head");
        console.log(head_track);
        setHead(head_track);
      } catch (error) {
        console.log(error);
      }
    };
    refresh_queue();
    refresh_head();
  }, [nav]);

  return (
    <Grid
      item
      xs={queue_tab_visible ? 4 : 0}
      display={queue_tab_visible ? "flex" : "none"}
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
          {"Queue"}
        </Typography>
        <IconButton
          onClick={() => {
            setQueueVisible(false);
          }}
        >
          <Close />
        </IconButton>
      </AppBar>
      {queue_tracks && head ? (
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
            key={head.id}
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
              <Avatar alt={head.name} src={head.album?.images[0].url} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography sx={{ color: colors.green[600], fontWeight: 500 }}>
                  {head?.name}
                </Typography>
              }
              secondary={
                <Typography sx={{ color: colors.grey[600], fontWeight: 400 }}>
                  {
                    <>
                      {head?.artists.map((e, _) => (
                        <Link
                          onClick={async (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            let artist_page = await generate_artist_page(e.id);
                            if (artist_page) {
                              nextPage(nav, setNav, artist_page);
                            }
                          }}
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
          {queue_tracks.map((track, track_index) => (
            <ListItem
              onClick={async () => {
                console.log("Clicked");
                await play_tracks([track], true, true);
              }}
              key={track.id + track_index}
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
                  <Typography sx={{ color: colors.grey[400], fontWeight: 500 }}>
                    {track.name}
                  </Typography>
                }
                secondary={track.artists.map((a, _) => (
                  <Link
                    onClick={async (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      let artist_page = await generate_artist_page(a.id);
                      if (artist_page) {
                        nextPage(nav, setNav, artist_page);
                      }
                    }}
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
                    let _: string = await invoke("remove_from_playlist", {
                      index: track_index,
                    });
                  } catch (error) {
                    console.log(error);
                  }
                }}
              >
                <RemoveSharp fontSize="medium" />
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
  );
};

export { Home as default, JomoNavigationContext };
