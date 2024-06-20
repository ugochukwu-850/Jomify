import { Box } from "@mui/material";
import JomoAppBar from "./appbar";
import FeaturedPlaylist, { MainPlaylistDiver } from "./content_menu";

const Main = () => {
  return (
    <Box
      sx={{
        background:
          "linear-gradient(0deg, #121212  0%,  rgba(27,26,26,1)  100%)",
        padding: "4px",
        borderRadius: "12px",
        margin: "0 12px",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        rowGap: "1em",
        height: "100%",
      }}
    >
      <JomoAppBar />
      <Box sx={{ overflowY: "scroll", padding: "12px" }}>
        <FeaturedPlaylist />
        <MainPlaylistDiver />
      </Box>
    </Box>
  );
};

export default Main;
