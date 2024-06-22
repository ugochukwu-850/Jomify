import { Box } from "@mui/material";
import JomoAppBar from "./appbar";
import FeaturedPlaylist, { MainPlaylistDiver } from "./content_menu";
import {
  HomeResponse,
  Page as DetailPage,
  JomoNavigation,
} from "../../../types";
import { FC, useState } from "react";
import DetailPageView from "./page_view";
import nextPage from "../../../util";
interface mainProp {
  props: HomeResponse | null;
}

const Main: FC<mainProp> = ({ props }): JSX.Element => {
  if (props == null) {
    return <></>;
  }
  let [nav, setNav] = useState<JomoNavigation>({
    previous: null,
    next: null,
    data: null
  });

  return (
    <Box
      sx={{
        background:
          "linear-gradient(0deg, #121212  40%,  rgba(0,26,26,1)  100%)",
        padding: "4px",
        borderRadius: "12px",
        margin: "0 12px",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        rowGap: "1em",
        height: "100%",
      }}
    >
      <JomoAppBar nav={nav} setNav={setNav} />

      <Box sx={{ overflowY: "scroll", padding: "12px" }}>
        {!nav.data ? (
          <>
            <FeaturedPlaylist
              data={props.featured_playlists}
              setNav={setNav}
              nav={nav}
            />
            <MainPlaylistDiver data={props.gallery} setNav={setNav} nav={nav} />
          </>
        ) : (
          <DetailPageView page={nav.data} setNav={setNav} />
        )}
      </Box>
    </Box>
  );
};

export default Main;
