import { AppBar, Box, Grid, Typography } from "@mui/material";
import JomoAppBar from "./appbar";
import FeaturedPlaylist, { MainPlaylistDiver } from "./content_menu";
import {
  HomeResponse,
  DefaultObjectPage as DetailPage,
  JomoNavigation,
} from "../../../types";
import { FC, useContext, useEffect, useState } from "react";
import DetailPageView from "./page_view";
import nextPage from "../../../util";
import { GlobalState } from "../../../App";
import AuthPage from "../../AuthHome/main";
import { JomoNavigationContext } from "..";
interface mainProp {
  props: HomeResponse | undefined;
}

const Main: FC<mainProp> = ({ props }): JSX.Element => {
  let nav_context = useContext(JomoNavigationContext);
  if (nav_context) {
    nav_context;
  } else {
    return <></>;
  }
  let { nav, setNav } = nav_context;
  let app_state = useContext(GlobalState);

  if (app_state == undefined) {
    return <></>;
  }

  let { global_state } = app_state;
  return global_state.logged_in ? (
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

      <Box sx={{ padding: "12px", overflowY: "scroll"}}>
        {!nav.data ? (
          <>
            <FeaturedPlaylist
              data={props ? props.featured_playlists : null}
              setNav={setNav}
              nav={nav}
            />
            <MainPlaylistDiver
              data={props ? props.gallery : null}
              setNav={setNav}
              nav={nav}
            />
          </>
        ) : (
          <DetailPageView page={nav.data} />
        )}
      </Box>
    </Box>
  ) : (
    <AuthPage />
  );
};

export default Main;
