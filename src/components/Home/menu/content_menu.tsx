import {
  PlayArrow,
  PlayArrowOutlined,
  ViewComfyOutlined,
  ViewQuiltOutlined,
} from "@mui/icons-material";
import {
  Box,
  CardMedia,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
  lighten,
} from "@mui/material";
import { DefaultObjectsPreview, JomoNavigation, Page } from "../../../types";
import { FC, useState } from "react";
import nextPage from "../../../util";
interface MajorProp {
  data: DefaultObjectsPreview[] | null;
  setNav: React.Dispatch<React.SetStateAction<JomoNavigation>>
  nav: JomoNavigation
}
const FeaturedPlaylist: FC<MajorProp> = ({ data, setNav, nav }) => {
  if (data == null) {
    return <></>;
  }
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "900" }}>
        Featured Playlists
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          placeContent: "space-between",
        }}
      >
        {data.map((datum, index) => (
          <Box
            key={index}
            sx={{
              margin: "2px 0",
              "& :hover": { background: lighten("#242424", 0.05) },
              transition: "1 ease-in-out 0.3s",
              cursor: "pointer",
            }}
            onClick={() => {
              let page: Page = { header: datum };
              nextPage(nav, setNav, page);
            }}
          >
            <Box
              sx={{
                minWidth: "360px",
                maxWidth: "400px",
                display: "grid",
                gridTemplateColumns: "auto 50% auto",
                gap: ".2em",
                background: "#242424",
                borderRadius: "12px",
                margin: "4px 12px",
              }}
            >
              <CardMedia
                component="img"
                sx={{ width: "54px", borderRadius: "12px 0 0 12px" }}
                image={datum.image[0].url}
              />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "500",
                  padding: "0 2px",
                  margin: "auto  2px",
                  textAlign: "start",
                }}
              >
                {datum.name}
              </Typography>
              <IconButton
                sx={{
                  margin: "auto",
                  "& :hover": { background: "green", borderRadius: "inherit" },
                }}
              >
                <PlayArrow
                  sx={{
                    padding: "2px",
                  }}
                />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const MainPlaylistCollage: FC<MajorProp> = ({
  data,
  setNav,
  nav
}) => {
  let [mansory, setMansory] = useState(true);
  if (data == null) {
    return <></>;
  } else {
    return (
      <Box sx={{ margin: "12px 0" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            placeContent: "space-between",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "900" }}>
            Gallery
          </Typography>
          <IconButton
            onClick={() => {
              setMansory(!mansory);
            }}
          >
            {mansory ? <ViewComfyOutlined /> : <ViewQuiltOutlined />}
          </IconButton>
        </Box>
        <ImageList
          sx={{
            width: "100%",
            height: "max-content",
            padding: "12px",
            borderRadius: "12px",
          }}
          variant={mansory ? "masonry" : "quilted"}
          cols={4}
          rowHeight={141}
        >
          {shuffleArray(data).map((item, index) => (
            <ImageListItem
              sx={{ borderRadius: "12px" }}
              key={index}
              cols={item.col || 1}
              rows={item.row || 1}
              onClick={() => {
                let page: Page = { header: item };
                nextPage(nav, setNav, page );
              }}
            >
              <img
                {...srcset(item.image[0].url, 121, item.row, item.col)}
                alt={item.name}
                loading="lazy"
                style={{ borderRadius: "12px" }}
              />
              <ImageListItemBar
                sx={{
                  padding: "0 8px",
                  borderRadius: "12px 12px ",
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
                    "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                }}
                title={item.name}
                subtitle={
                  item.artist
                    .map((e, _) => {
                      e.name;
                    })
                    .join(", ") ||
                  item.description ||
                  "Music Playlist Information"
                }
                actionIcon={
                  <IconButton
                    sx={{ color: "rgba(255, 255, 255, 0.74)" }}
                    aria-label={`info about ${item.name}`}
                  >
                    <PlayArrowOutlined />
                  </IconButton>
                }
                position="top"
              />
            </ImageListItem>
          ))}
        </ImageList>
      </Box>
    );
  }
  function srcset(image: string, size: number, rows = 1, cols = 1) {
    return {
      src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
      srcSet: `${image}?w=${size * cols}&h=${
        size * rows
      }&fit=crop&auto=format&dpr=2 2x`,
    };
  }
  /**
   * Shuffles an array in place using the Fisher-Yates (Knuth) shuffle algorithm.
   * @param array The array to shuffle.
   * @returns The shuffled array.
   */
  function shuffleArray<T>(array: T[]): T[] {
    const shuffledArray = array.slice(); // Create a copy of the array to avoid mutating the original array
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ]; // Swap elements
    }
    return shuffledArray;
  }
};
export {
  FeaturedPlaylist as default,
  MainPlaylistCollage as MainPlaylistDiver,
};
