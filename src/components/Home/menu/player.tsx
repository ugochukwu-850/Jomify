import {
  Box,
  IconButton,
  CardMedia,
  Slider,
  Stack,
  Typography,
  duration,
  Link,
} from "@mui/material";
import styles from "../index.module.scss";
import {
  Lyrics,
  LyricsOutlined,
  Museum,
  MusicVideo,
  Pause,
  PauseCircle,
  PauseCircleFilledOutlined,
  PauseCircleFilledSharp,
  PauseOutlined,
  PausePresentationRounded,
  PlayArrowRounded,
  PlaylistAdd,
  PlaylistAddCircleOutlined,
  QueueMusic,
  QueueMusicOutlined,
  RepeatOnOutlined,
  RepeatOneOutlined,
  Replay,
  Shuffle,
  SkipNextRounded,
  SkipPrevious,
  Speaker,
  VideoFile,
  VideoLabel,
  VideoLabelSharp,
  VideogameAsset,
  ViewDay,
  VolumeDown,
  VolumeDownOutlined,
} from "@mui/icons-material";
import { JomoSlider } from "../theme";
import { invoke } from "@tauri-apps/api/tauri";
import { FC, useContext, useEffect, useState } from "react";
import { appWindow } from "@tauri-apps/api/window";
import { PlayingAction, Track, QueueMenuContext, Artist } from "../../../types";
import { formatDuration } from "../../../util";
import { RightSideMenuContext } from "..";
interface TrackFeed {
  track: Track | undefined;
}
const PlayerDetails: FC<TrackFeed> = ({ track }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      <CardMedia
        component="img"
        image={
          track?.album?.images[0].url
            ? track.album.images[0].url
            : "https://buffer.com/cdn-cgi/image/w=1000,fit=contain,q=90,f=auto/library/content/images/size/w600/2023/10/free-images.jpg"
        }
        sx={{
          width: "80px",
          margin: "0 8px",
          borderRadius: "8px",
          height: "auto",
        }}
      />
      <Box sx={{ margin: "auto 4px" }}>
        <Typography variant="body1" fontWeight={900}>
          {track ? track.name : "-------------"}
        </Typography>
        <Typography variant="body2" sx={{ color: "grey" }}>
          {track?.artists ? (
            <>
              {track.artists.map((e, _) => (
                <Link sx={{ padding: "0 4px" }} href={e.id}>
                  {e.name}
                </Link>
              ))}
            </>
          ) : (
            "-------------"
          )}
        </Typography>
      </Box>
    </Box>
  );
};
const PlayerControls = (props: { duration: number | undefined }) => {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [repeat, setRepeat] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let update_track = async () => {
      try {
        // listen for the curren_playing emittion
        const unlisten = await appWindow.listen<string>(
          "current-playing-changed",
          (event) => {
            let track = JSON.parse(event.payload) as Track;
            if (track.id) {
              setPosition(0);
              // set the loading to true
              setLoading(true);
            }
            console.log("Printing the event response", event.payload);
          }
        );
      } catch (error) {
        console.log(error);
      }
    };
    let update_loading = async () => {
      try {
        // listen for the curren_playing emittion
        const unlisten = await appWindow.listen<string>("loading", (event) => {
          setLoading(false);

          console.log("Printing the event response", event.payload);
        });
      } catch (error) {
        console.log(error);
      }
    };
    update_track();
    update_loading();
  }, []);
  useEffect(() => {
    let timeoutId: number;

    const tick = () => {
      if (
        props.duration &&
        playing &&
        position <= props.duration / 1000 &&
        !loading
      ) {
        setPosition((prevPosition) => prevPosition + 1);
      } else if (
        props.duration &&
        position >= Math.floor(props.duration / 1000)
      ) {
        // Reset position to 0 when it reaches duration
        setPosition(0);
      }
    };

    timeoutId = setTimeout(tick, 1000);

    // Cleanup function to clear timeout on component unmount or dependency change
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [props.duration, position, playing, loading]);
  useEffect(() => {
    let update_play_status = async () => {
      try {
        // listen for the curren_playing emittion
        const unlisten = await appWindow.listen<string>(
          "sink-playing-status",
          (event) => {
            try {
              let status = JSON.parse(event.payload) as PlayingAction;
              console.log("Playing data now", status);

              if (status.playing) {
                setPlaying(true);
              } else if (status.playing === false) {
                setPlaying(false);
              }

              console.log(
                "Printing the event response of playing",
                event.payload
              );
            } catch (error) {
              console.error("Failed to parse JSON payload:", error);
            }
          }
        );
      } catch (error) {
        console.log(error);
      }
    };
    update_play_status();
  }, []);
  return (
    <Stack>
      <Box sx={{ height: "80%", margin: "auto" }}>
        <IconButton>
          <Shuffle />
        </IconButton>
        <IconButton
          onClick={async () => {
            console.log("clicked previous");
            await appWindow.emit("next-previous");
            setPosition(0);
          }}
        >
          <SkipPrevious />
        </IconButton>
        <IconButton
          onClick={async () => {
            console.log("clicked");
            await appWindow.emit("toggle-play", {
              message: "Tauri is awesome",
            });
          }}
        >
          {playing ? <PausePresentationRounded /> : <PlayArrowRounded />}
        </IconButton>
        <IconButton
          onClick={async () => {
            console.log("clicked next");
            await appWindow.emit("next-previous", {
              message: "",
            });
            setPosition(0);
          }}
        >
          <SkipNextRounded />
        </IconButton>
        <IconButton
          onClick={async () => {
            try {
              await appWindow.emit("toggle-repeat");
              setRepeat(!repeat);
            } catch (error) {
              console.log(error);
            }
          }}
        >
          {!repeat ? <Replay /> : <RepeatOneOutlined sx={{ color: "green" }} />}
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "1em",
          placeContent: "space-evenly",
        }}
      >
        <Typography sx={{ margin: "auto", color: "grey" }} variant="body2">
          {props.duration ? formatDuration(position * 1000) : "---"}
        </Typography>
        <JomoSlider
          value={position}
          defaultValue={0}
          onChange={async (_, value) => {
            // set the backend positon
            let e = await appWindow.emit("seek", value);
            setPosition(value as number);
          }}
          max={props.duration ? props.duration / 1000 : 0}
        />
        <Typography sx={{ margin: "auto", color: "grey" }} variant="body2">
          {props.duration ? formatDuration(props.duration) : "---"}
        </Typography>
      </Box>
    </Stack>
  );
};

const PlayerActions = () => {
  let [volume, setVolume] = useState(1.0);
  let context = useContext(RightSideMenuContext);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        placeContent: "space-evenly",
        padding: "0 12px",
      }}
    >
      <Box sx={{ placeContent: "space-evenly", gap: ".1em" }}>
        <IconButton>
          <MusicVideo sx={{ fontSize: "1.2rem" }} />
        </IconButton>
        <IconButton
          onClick={() => {
            if (context) {
              // update the value else return : We are sure it is always some
              console.log("Toggled queue showing");
              context.setData({ ...context.data, open: !context.data.open });
              console.log(context.data.open);
            }
          }}
        >
          <LyricsOutlined sx={{ fontSize: "1.2rem" }} />
        </IconButton>
        <IconButton>
          <QueueMusicOutlined sx={{ fontSize: "1.2rem" }} />
        </IconButton>
        <IconButton>
          <PlaylistAddCircleOutlined sx={{ fontSize: "1.2rem" }} />
        </IconButton>
      </Box>
      <Box
        display={"flex"}
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          gap: "4px",
          padding: "0 12px",
          minWidth: "150px",
        }}
      >
        <VolumeDownOutlined sx={{ margin: "auto 0" }} />
        <JomoSlider
          min={0}
          value={volume}
          max={2.0}
          step={0.1}
          onChange={async (_, value) => {
            let e = await appWindow.emit("set-volume", value);
            setVolume(value as number);
          }}
          sx={{ margin: "auto 0" }}
        />
      </Box>
    </Box>
  );
};

const MusicPlayer = () => {
  // use an effect to listen for the head change
  let [track, setTrack] = useState<null | Track>(null);
  useEffect(() => {
    let update_track = async () => {
      try {
        // listen for the curren_playing emittion
        const unlisten = await appWindow.listen<string>(
          "current-playing-changed",
          (event) => {
            let track = JSON.parse(event.payload) as Track;
            if (track.id) {
              setTrack(track);
            }
            console.log("Printing the event response", event.payload);
          }
        );
      } catch (error) {
        console.log(error);
      }
    };
    update_track();
  }, []);
  if (track) {
    return (
      <Box className={styles.player}>
        <PlayerDetails track={track} />
        <PlayerControls duration={track?.duration_ms} />
        <PlayerActions />
      </Box>
    );
  } else {
    return (
      <Box className={styles.player}>
        <PlayerDetails track={undefined} />
        <PlayerControls duration={undefined} />
        <PlayerActions />
      </Box>
    );
  }
};

export default MusicPlayer;
