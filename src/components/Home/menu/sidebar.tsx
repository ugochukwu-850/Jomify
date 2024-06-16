import { Home, HomeMax, LibraryMusicRounded, MusicNote, Settings } from "@mui/icons-material";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import style from "../index.module.scss";


const HomeSideMenu = () => {
  return (
    <List sx={{display: "grid", gridTemplateRows: "90% auto"}} className={style.side_bar}>
    <Box>
      <ListItem key={0}>
        <ListItemButton autoFocus>
          <ListItemIcon>
            <MusicNote/>
          </ListItemIcon>
          <ListItemText  primary="Jomify"/>
        </ListItemButton>
      </ListItem>
      <ListItem key={0}>
        <ListItemButton>
          <ListItemIcon color="red">
            <HomeMax />
          </ListItemIcon>
          <ListItemText className={style.main} primary="Home"/>
        </ListItemButton>
      </ListItem>
      <ListItem key={0}>
        <ListItemButton>
          <ListItemIcon>
            <LibraryMusicRounded />
          </ListItemIcon>
          <ListItemText primary="Library"/>
        </ListItemButton>
      </ListItem>
    </Box>

    <ListItem key={0}>
      <ListItemButton>
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
