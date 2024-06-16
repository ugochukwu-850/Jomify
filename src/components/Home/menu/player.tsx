import {
  Box,
  Button,
  CardMedia,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import styles from "../index.module.scss";
import {
  Lyrics,
  LyricsOutlined,
  Museum,
  MusicVideo,
  PlayArrowRounded,
  PlaylistAdd,
  PlaylistAddCircleOutlined,
  QueueMusic,
  QueueMusicOutlined,
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

const PlayerDetails = (props: {
  MusicImage: string;
  artistNames: string[] | string;
  musicName: string;
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      <CardMedia
        component="img"
        image="https://buffer.com/cdn-cgi/image/w=1000,fit=contain,q=90,f=auto/library/content/images/size/w600/2023/10/free-images.jpg"
        sx={{
          width: "80px",
          margin: "0 8px",
          borderRadius: "8px",
          height: "auto",
        }}
      />
      <Box sx={{ margin: "auto 4px" }}>
        <Typography variant="body1" fontWeight={900}>
          Unavailable by Davido
        </Typography>
        <Typography variant="body2" sx={{ color: "grey" }}>
          Davido, Musa Keys
        </Typography>
      </Box>
    </Box>
  );
};
const PlayerControls = () => {
  return (
    <Stack>
      <Box sx={{ height: "80%", margin: "auto" }}>
        <Button>
          <Shuffle />
        </Button>
        <Button>
          <SkipPrevious />
        </Button>
        <Button>
          <PlayArrowRounded />
        </Button>
        <Button>
          <SkipNextRounded />
        </Button>
        <Button>
          <Replay />
        </Button>
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
          0:00
        </Typography>
        <JomoSlider />
        <Typography sx={{ margin: "auto", color: "grey" }} variant="body2">
          2:49
        </Typography>{" "}
      </Box>
    </Stack>
  );
};
const PlayerActions = () => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "70% auto",
        padding: "0 12px",
      }}
    >
      <Box sx={{ placeContent: "space-evenly" }}>
        <Button>
          <MusicVideo sx={{ fontSize: "1.5rem" }} />
        </Button>
        <Button>
          <LyricsOutlined sx={{ fontSize: "1.5rem" }} />
        </Button>
        <Button>
          <QueueMusicOutlined sx={{ fontSize: "1.5rem" }} />
        </Button>
        <Button>
          <PlaylistAddCircleOutlined sx={{ fontSize: "1.5rem" }} />
        </Button>
      </Box>
      <Box
        display={"flex"}
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          gap: "4px",
          padding: "0 12px",
        }}
      >
        <VolumeDownOutlined sx={{ margin: "auto 0" }} />
        <JomoSlider max={15} sx={{ margin: "auto 0" }} />
      </Box>
    </Box>
  );
};

const MusicPlayer = () => {
  return (
    <Box className={styles.player}>
      <PlayerDetails MusicImage={""} artistNames={""} musicName={""} />
      <PlayerControls />
      <PlayerActions />
    </Box>
  );
};

export default MusicPlayer;
