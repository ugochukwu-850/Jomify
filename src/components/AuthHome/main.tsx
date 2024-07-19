/// <reference types="vite-plugin-svgr/client" />

import {
  Box,
  Button,
  CardMedia,
  Divider,
  Grid,
  Stack,
  ThemeProvider,
  Typography,
} from "@mui/material";
import styles from "./index.module.scss";
import customThemes from "./theme";

import SpotifyIcon from "../../assets/spotify.svg";
import SpotifyIconPng from "../../assets/spotify.png";
import YouTubeMusicIcon from "../../assets/youtubemusic.svg";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

async function InitiateAuthenticationFlow(
  clientId?: string
): Promise<void | URL> {
  // call the function for the client url generation
  try {
    await invoke("sign_in", {
      appName: "spotify",
      client_id: clientId,
    });
    console.log("Emitted the sign_in command");
  } catch (error) {
    console.log(error);
  }
}

const AuthPage = () => {
  const { customTheme, WhiteOutlinedTextField } = customThemes;
  var [clientId, setClientId] = useState<string | undefined>(undefined);

  return (
    <ThemeProvider theme={customTheme}>
      <Grid
        container
        columns={4}
        sx={{ borderRadius: "12px", height: "100%" }}
        className={`${styles.dark}`}
      >
        <Grid item xs={4} md={2}>
          <Stack className={`${styles.leftbox}`}>
            <CardMedia sx={{width: "60%", height: "60%"}} component="img" image={SpotifyIconPng} />
            <Typography variant="h6">
              Powered By <span>Spotify</span> and <span>Youtube</span>
            </Typography>
            <span className={styles.tandc}>
              By Signing Up, you agree to the{" "}
              <a href="#">Terms and Conditions</a> and{" "}
              <a href="#">Privacy Policy, </a>including{" "}
              <a href="#"> Cookie Use</a>
            </span>
          </Stack>
        </Grid>
        <Grid item xs={4} md={2}>
          <Stack className={`${styles.rightbox}`}>
            <Typography variant="h1">
              Streaming <span style={{ color: "green" }}>Now</span>
            </Typography>
            <Typography variant="h5">Sign In</Typography>
            <hr />
            <Box
              component="form"
              noValidate
              autoComplete="off"
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                InitiateAuthenticationFlow(clientId);
              }}
            >
              <WhiteOutlinedTextField
                id="clientId"
                placeholder="32 bit Key from spotify"
                label="Client Id"
                helperText="Input your client Id from Spotify and Hit Enter"
                className="signupinput"
                fullWidth
                onChange={(e) => {
                  setClientId(e.target.value);
                }}
              />
            </Box>
            <Divider
              sx={{
                "&::before, &::after": {
                  borderColor: "green",
                },
                width: "90%",
                margin: "1em auto",
              }}
            >
              <customThemes.WhiteFilledChip label="Or" size="medium" />
            </Divider>

            <Box className={styles.signupbts}>
              <Button
                variant="outlined"
                startIcon={<SpotifyIcon />}
                onClick={() => {
                  InitiateAuthenticationFlow();
                }}
              >
                <span>
                  Sign In With <span style={{ color: "green" }}> Spotify</span>
                </span>
              </Button>
              <Button variant="outlined" startIcon={<YouTubeMusicIcon />}>
                <span>
                  Sign In With{" "}
                  <span style={{ color: "red" }}> Youtube Music</span>
                </span>
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default AuthPage;
