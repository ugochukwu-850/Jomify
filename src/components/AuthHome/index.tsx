/// <reference types="vite-plugin-svgr/client" />

import {
  Box,
  Button,
  CardMedia,
  Chip,
  Divider,
  Link,
  Stack,
  SvgIcon,
  ThemeProvider,
  Typography,
} from "@mui/material";
import styles from "./index.module.scss";
import customThemes from "./theme";

import SpotifyIcon from "../../assets/spotify.svg";
import YouTubeMusicIcon from "../../assets/youtubemusic.svg";

const AuthPage = () => {
  const { theme, WhiteOutlinedTextField } = customThemes;
  return (
    <ThemeProvider theme={theme}>
      <Box component="div" className={`${styles.dark} ${styles.container} `}>
        <Stack className={`${styles.leftbox}`}>
          <CardMedia
            component="img"
            image="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png"
          />
          <Typography variant="h6">
            Powered By <span>spotify</span> and <span>Youtube</span>
          </Typography>
          <span className={styles.tandc}>
            By Signing Up, you agree to the <a href="#">Terms and Conditions</a>{" "}
            and <a href="#">Privacy Policy, </a>including <a href="#"> Cookie Use</a>
          </span>
        </Stack>
        <Stack className={`${styles.rightbox}`}>
          <Typography variant="h1">Streaming Now</Typography>
          <Typography variant="h5">
            Your favourite audio platform but <span> Better</span>
          </Typography>
          <hr />
          <Box
            component="form"
            noValidate
            autoComplete="off"
            className={styles.form}
          >
            <WhiteOutlinedTextField
              id="clientSecret"
              placeholder="32 Bit Secret from spotify"
              label="Client Secret"
              helperText="Input client secret from spotify"
              fullWidth
              color="success"
            />
            <WhiteOutlinedTextField
              id="clientId"
              placeholder="32 bit Key from spotify"
              label="Client Id"
              helperText="Input your client Id from Spotify"
              className="signupinput"
              fullWidth
            />
          </Box>
          <Divider
            sx={{
              "&::before, &::after": {
                borderColor: "green",
              },
              width: "90%",
              margin: "auto",
            }}
          >
            <customThemes.WhiteFilledChip label="Or" size="medium" />
          </Divider>

          <Box className={styles.signupbts}>
            <Button
              variant="outlined"
              startIcon={<SvgIcon component={SpotifyIcon} inheritViewBox />}
              onClick={() => {
                document.location.href = `https://accounts.spotify.com/authorize?
              response_type=code&
              client_id=YOUR_CLIENT_ID&
              redirect_uri=YOUR_REDIRECT_URI&
              scope=user-read-private%20user-read-email&
              state=STATE_STRING
            `;
              }}
            >
              <span>Sign Up With <span style={{ color: "green" }}> Spotify</span></span>
            </Button>
            <Button
              variant="outlined"
              startIcon={
                <SvgIcon component={YouTubeMusicIcon} inheritViewBox />
              }
            >
              <span>
                Sign Up With  <span style={{ color: "red" }}> Youtube Music</span>
              </span>
            </Button>
          </Box>
        </Stack>
      </Box>
    </ThemeProvider>
  );
};

export default AuthPage;
