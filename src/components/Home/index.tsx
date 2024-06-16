import { Box, CssBaseline, Grid, ThemeProvider } from "@mui/material";
import homeTheme from "./theme";
import HomeSideMenu from "./menu/sidebar";
import MusicPlayer from "./menu/player";
import Main from "./menu/main";

const Home = () => {
  return (
    <ThemeProvider theme={homeTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          placeContent: "space-between",
          padding: "4px 0",
          height: "100vh", // Use 100vh to cover the full viewport height
        }}
      >
        <Grid
          container
          columns={20}
          sx={{ padding: "8px 0", flex: "1", overflow: "hidden" }}
        >
          <Grid item xs={4} sx={{ overflow: "hidden" }}>
            <HomeSideMenu />
          </Grid>
          <Grid item xs={16} height={"100%"} sx={{ overflow: "hidden" }}>
            <Main />
          </Grid>
        </Grid>
        <MusicPlayer />
      </Box>
    </ThemeProvider>
  );
};

export { Home as default };
