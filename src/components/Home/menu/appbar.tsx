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
      <Grid container columns={16} sx={{ margin: "0" }}>
        <Grid
          item
          xs={4}
          md={3}
          lg={2}
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: ".2em",
            placeContent: "space-evenly",
            margin: "auto",
          }}
        >
          <Button className={styles.headerIconButton}>
            <ArrowBackIosOutlined className={styles.headerIcon} />
          </Button>
          <Button className={styles.headerIconButton}>
            <ArrowForwardIosOutlined className={styles.headerIcon} />
          </Button>
        </Grid>
        <Grid item xs={9} md={6} lg={10} sx={{padding: "2px 12px"}}>
          <JomoAppSearch
            variant="outlined"
            placeholder="Search"
            sx={{ minWidth: "300px", width: "50%" }}
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
            placeContent: "space-evenly",
          }}
          xs={6}
          lg={4}
          md={6}
        >
          <Typography className={styles.licenseStk} variant="body1">Spotify</Typography>
          <Button className={styles.headerIconButton}>
            <PersonOutlineOutlined className={styles.headerIcon} />
          </Button>
          <Button className={styles.headerIconButton}>
            <PaymentOutlined className={styles.headerIcon} />
          </Button>
        </Grid>
      </Grid>
    </AppBar>
  );
};

export default JomoAppBar;
