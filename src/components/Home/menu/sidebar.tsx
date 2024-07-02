import {
  Cancel,
  Home,
  HomeMax,
  LibraryMusicRounded,
  MusicNote,
  Settings,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useMediaQuery,
  colors
} from "@mui/material";
import style from "../index.module.scss";

const HomeSideMenu = () => {
  return (
    <List
      sx={{
        display: "grid",
        gridTemplateRows: "30% 60% auto",
        width: "100%",
        padding: "2px 6px",
      }}
      className={style.side_bar}
    >
      <Box>
        <ListItem key={0} onClick={() => {location.reload()}}>
          <ListItemButton
            autoFocus
            sx={{
              display: "flex",
              flexDirection: "row",
              placeContent: "space-evenly",
            }}
          >
            <ListItemIcon>
              <MusicNote />
            </ListItemIcon>
            <ListItemText primary="Jomify" />
          </ListItemButton>
        </ListItem>
        <ListItem key={1}>
          <ListItemButton
            sx={{
              display: "flex",
              flexDirection: "row",
              placeContent: "space-evenly",
            }}
          >
            <ListItemIcon color="red">
              <HomeMax />
            </ListItemIcon>
            <ListItemText className={style.main} primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem key={2}>
          <ListItemButton
            sx={{
              display: "flex",
              flexDirection: "row",
              placeContent: "space-evenly",
            }}
          >
            <ListItemIcon>
              <LibraryMusicRounded />
            </ListItemIcon>
            <ListItemText primary="Library" />
          </ListItemButton>
        </ListItem>
      </Box>

      <ListItem key={3}>
        <ListItemButton
          sx={{
            display: "flex",
            flexDirection: "row",
            placeContent: "space-evenly",
          }}
        >
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </ListItem>
    </List>
  );
};

export default HomeSideMenu;
