import { InfoOutlined, Pause, PlayArrow, PlayArrowOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  CardMedia,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  ListSubheader,
  Typography,
  lighten,
} from "@mui/material";

const FeaturedPlaylist = () => {
  const recommendations = Array(6).fill(0);
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
        {recommendations.map((_, index) => (
          <Box
            key={index}
            sx={{
              margin: "2px 0",
              "& :hover": { background: lighten("#242424", 0.05) },
              transition: "1 ease-in-out 0.3s",
              cursor: "pointer",
            }}
          >
            <Box
              sx={{
                minWidth: "360px",
                maxWidth: "400px",
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                background: "#242424",
                borderRadius: "8px",
                margin: "4px 12px",
              }}
            >
              <CardMedia
                component="img"
                sx={{ width: "54px", borderRadius: "6px 0 0 6px" }}
                image="https://img.freepik.com/premium-psd/club-dj-party-flyer-social-media-post_505751-4439.jpg?size=626&ext=jpg"
              />
              <Typography
                variant="body1"
                sx={{ fontWeight: "700", padding: "0 4px", margin: "auto 2px" }}
              >
                My Recommendation Playlist
              </Typography>
              <Button>
                <PlayArrow
                  sx={{
                    padding: "2px",
                    "& :hover": { color: "green" },
                    fontSize: "44px",
                  }}
                />
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const MainPlaylistDiver = () => {
  function srcset(image: string, size: number, rows = 1, cols = 1) {
    return {
      src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
      srcSet: `${image}?w=${size * cols}&h=${
        size * rows
      }&fit=crop&auto=format&dpr=2 2x`,
    };
  }

  function QuiltedImageList() {
    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: "900" }}>
          Most Loved Playlist
        </Typography>
        <ImageList
          sx={{
            width: "100%",
            height: "max-content",
            padding: "12px",
            borderRadius: "12px",
          }}
          variant="quilted"
          cols={4}
          rowHeight={121}
        >
          {itemData.map((item) => (
            <ImageListItem
              sx={{ borderRadius: "12px" }}
              key={item.img}
              cols={item.cols || 1}
              rows={item.rows || 1}
            >
              <img
                {...srcset(item.img, 121, item.rows, item.cols)}
                alt={item.title}
                loading="lazy"
                style={{ borderRadius: "12px" }}
              />
              <ImageListItemBar
              sx={{padding: "0 8px", borderRadius: "0 0 12px 12px "}}
                title={item.title}
                subtitle={item.author || "Music Playlist Information"}
                actionIcon={
                  <IconButton
                    sx={{ color: "rgba(255, 255, 255, 0.74)" }}
                    aria-label={`info about ${item.title}`}
                  >
                    <PlayArrowOutlined />
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      </Box>
    );
  }

  const itemData = [
    {
      img: "https://plus.unsplash.com/premium_photo-1715876267697-800a09450c4b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwzM3x8fGVufDB8fHx8fA%3D%3D",
      title: "Breakfast",
      rows: 2,
      cols: 2,
    },
    {
      img: "https://img.freepik.com/premium-psd/club-dj-party-flyer-social-media-post-web-banner-template_505751-2237.jpg?size=626&ext=jpg",
      title: "Janie Love",
    },
    {
      img: "https://img.freepik.com/free-psd/spring-party-square-flyer-template-with-photo_23-2148465200.jpg?size=626&ext=jpg",
      title: "Camera",
      rows: 1
    },
    {
      img: "https://img.freepik.com/premium-psd/vinyl-logo-mockup-psd_93536-1933.jpg?size=626&ext=jpg",
      title: "Coffee",
      cols: 2,
    },
    {
      img: "https://images.unsplash.com/photo-1533827432537-70133748f5c8",
      title: "Hats",
      cols: 1,
    },
    {
      img: "https://images.unsplash.com/photo-1718420814549-3a812ee97e1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxOHx8fGVufDB8fHx8fA%3D%3D",
      title: "Honey",
      author: "@arwinneil",
      rows: 2,
      cols: 2,
    },
    {
      img: "https://images.unsplash.com/photo-1516802273409-68526ee1bdd6",
      title: "Basketball",
    },
    {
      img: "https://images.unsplash.com/photo-1518756131217-31eb79b20e8f",
      title: "Fern",
    },
    {
      img: "https://images.unsplash.com/photo-1597645587822-e99fa5d45d25",
      title: "Mushrooms",
      rows: 2,
      cols: 2,
    },
    {
      img: "https://img.freepik.com/premium-psd/night-party-social-media-template_597327-724.jpg?size=626&ext=jpg&ga=GA1.1.2085574500.1718559299&semt=ais_user",
      title: "Tomato basil",
    },
    {
      img: "https://img.freepik.com/free-psd/club-dj-party-flyer-social-media-post_505751-3401.jpg?size=626&ext=jpg&ga=GA1.1.2085574500.1718559299&semt=ais_user",
      title: "Sea star",
    },
    {
      img: "https://images.unsplash.com/photo-1589118949245-7d38baf380d6",
      title: "Bike",
      cols: 2,
    },
  ];

  return QuiltedImageList();
};

export { FeaturedPlaylist as default, MainPlaylistDiver };
