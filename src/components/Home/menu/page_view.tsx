import {
  Box,
  Card,
  CardMedia,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  colors,
} from "@mui/material";
import { FC, useState } from "react";
import { JomoNavigation, Page } from "../../../types";
import {
  ImportContacts,
  PlayArrow,
  PlayCircleFilledOutlined,
  PunchClock,
  ViewAgendaSharp,
  ViewListOutlined,
} from "@mui/icons-material";
import SpotifyIcon from "../../../assets/spotify.svg";
interface PageProps {
  page: Page;
  setNav: React.Dispatch<React.SetStateAction<JomoNavigation>>;
}

const DetailPageView: FC<PageProps> = ({ page, setNav }) => {
  return (
    <Box>
      {/* Header displayer */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          placeContent: "baseline",
          gap: "2em",

          background: "transparent",
        }}
      >
        <CardMedia
          component={"img"}
          image={page.header.image[0].url}
          sx={{ width: "240px", borderRadius: "12px" }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: ".2em",
            placeContent: "baseline",
            margin: "auto 0",
          }}
        >
          <Typography variant="body2">{page.header.object_type}</Typography>
          <Typography variant="h2">{page.header.name}</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, color: "grey" }}>
            {page.header.description}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <SpotifyIcon />
            <Typography
              variant="body2"
              sx={{ textAlign: "baseline", margin: "auto 12px"}}
            >
              {"Created By "}
              {page.header.artist
                .map((e, i) => {
                  console.log(e.name);
                  return e.name;
                })
                .join(" ")}
            </Typography>
            <Typography variant="body1">
              {page?.tracks ? `${page?.tracks?.length} songs` : ""}
            </Typography>
            {
              <Typography
                variant="body2"
                sx={{ textAlign: "center", margin: "auto 6px" }}
              >
                About{" "}
                {Math.floor(
                  page?.tracks
                    ? page.tracks.reduce((total, track) => {
                        return total + track.duration;
                      }, 0)
                    : 0
                ) / 3600}
                {" minutes"}
              </Typography>
            }
          </Box>
        </Box>
      </Box>
      {/*Tracks Control*/}
      <Box sx={{ margin: "12px 0" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton>
            <PlayCircleFilledOutlined sx={{ fontSize: "56px" }} />
          </IconButton>
          <IconButton sx={{ height: "max-content" }}>
            <ViewListOutlined />
          </IconButton>
        </Box>
        <TableContainer
          sx={{
            width: "100%",
            maxHeight: "64vh",
            margin: "0 auto",
          }}
        >
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell key="1" align="left" style={{ minWidth: 5 }}>
                  <Typography>#</Typography>
                </TableCell>
                <TableCell key="1" align="left" style={{ minWidth: 100 }}>
                  <Typography>Title</Typography>
                </TableCell>
                <TableCell key="1" align="left" style={{ minWidth: 100 }}>
                  <Typography>Album</Typography>
                </TableCell>
                <TableCell key="1" align="left" style={{ minWidth: 100 }}>
                  <Typography>Date Added</Typography>
                </TableCell>
                <TableCell key="1" align="left" style={{ minWidth: 100 }}>
                  <PunchClock />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow> <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow> <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow> <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow> <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow> <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow> <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow> <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow> <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow> <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow> <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow> <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow> <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow> <TableRow sx={{"&:hover": {cursor: "pointer"}}}>
                <HoverableTableCell count={1}/>
                <TableCell
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    gap: ".5em",
                    minWidth: 100,
                  }}
                  style={{ minWidth: 100 }}
                >
                  <Card sx={{ background: "transparent" }} elevation={0}>
                    <CardMedia
                      component={"img"}
                      sx={{ width: "48px", rowGap: ".5em" }}
                      image="https://i.scdn.co/image/ab67706f0000000209acda13f2655f4907258bf4"
                    />
                  </Card>
                  <Box>
                    <Typography>Dealer</Typography>
                    <Typography variant="body1" sx={{color: colors.grey[700], fontWeight: "500"}}>AyoMaff FireBoy and DMW</Typography>
                  </Box>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}} >Dealer</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>{new Date().toUTCString()}</Typography>
                </TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  <Typography sx={{color: "grey", fontWeight: "500"}}>3:00</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};
interface HVC {
  count: number
}
const HoverableTableCell: FC<HVC> = ({count}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <TableCell
      style={{ width: "20px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered ? <PlayArrow /> : count}
    </TableCell>
  );
};
export default DetailPageView;
