import { Home, HomeMax, LibraryMusicRounded, MusicNote, Settings } from "@mui/icons-material";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import style from "../index.module.scss";


const HomeSideMenu = () => {
  return (
    <List sx={{display: "grid", gridTemplateRows: "90% auto", width: "100%"}} className={style.side_bar}>
    <Box>
      <ListItem key={0}>
        <ListItemButton autoFocus sx={{display: "flex", flexDirection: "row", placeContent: "space-evenly"}}>
          <ListItemIcon>
            <MusicNote/>
          </ListItemIcon>
          <ListItemText  primary="Jomify"/>
        </ListItemButton>
      </ListItem>
      <ListItem key={1}>
        <ListItemButton sx={{display: "flex", flexDirection: "row", placeContent: "space-evenly"}}>
          <ListItemIcon color="red">
            <HomeMax />
          </ListItemIcon>
          <ListItemText className={style.main} primary="Home"/>
        </ListItemButton>
      </ListItem>
      <ListItem key={2}>
        <ListItemButton sx={{display: "flex", flexDirection: "row", placeContent: "space-evenly"}}>
          <ListItemIcon>
            <LibraryMusicRounded />
          </ListItemIcon>
          <ListItemText primary="Library"/>
        </ListItemButton>
      </ListItem>
    </Box>

    <ListItem key={3} >
      <ListItemButton sx={{display: "flex", flexDirection: "row", placeContent: "space-evenly"}}>
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
