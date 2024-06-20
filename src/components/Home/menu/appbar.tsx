import {
  ArrowBackIosOutlined,
  ArrowForwardIosOutlined,
  PaymentOutlined,
  PersonOutlineOutlined,
  SearchRounded,
} from "@mui/icons-material";
import {
  AppBar,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  SvgIcon,
  Typography,
} from "@mui/material";
import { JomoAppSearch } from "../theme";
import styles from "../index.module.scss";

const JomoAppBar = () => {
  return (
    <AppBar
      elevation={0}
      position="relative"
      sx={{ background: "transparent" }}
    >
      <Grid container columns={16} sx={{ margin: "0" , padding: "4px 12px"}}>
        <Grid
          item
          xs={2}
        
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: ".2em",
            margin: "auto",
          }}
        >
          <IconButton className={styles.headerIconButton}>
            <ArrowBackIosOutlined className={styles.headerIcon} />
          </IconButton>
          <IconButton className={styles.headerIconButton}>
            <ArrowForwardIosOutlined className={styles.headerIcon} />
          </IconButton>
        </Grid>
        <Grid item xs={8} sx={{ padding: "2px 12px" }}>
          <JomoAppSearch
            variant="outlined"
            placeholder="Search"
            sx={{ minWidth: "200px", width: "60%" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid
          item
          sx={{
            margin: "auto",
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            placeContent: "end",
            gap: "24px"
          }}
          xs={6}
        
        >
          <Typography className={styles.licenseStk} variant="body1">
            Spotify
          </Typography>
          <IconButton className={styles.headerIconButton}>
            <PersonOutlineOutlined className={styles.headerIcon} />
          </IconButton>
          <IconButton className={styles.headerIconButton}>
            <PaymentOutlined className={styles.headerIcon} />
          </IconButton>
        </Grid>
      </Grid>
    </AppBar>
  );
};

export default JomoAppBar;
