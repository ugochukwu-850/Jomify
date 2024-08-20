import { Slider, TextField, colors, createTheme, styled } from "@mui/material";

const homeTheme = createTheme({
  
  palette: {
    mode: "dark",
    primary: {
      main: colors.common.white,
    },
    secondary: {
      main: colors.grey[700],
    },
    text: {
      primary: colors.common.white,
      secondary: colors.grey[600],
      disabled: colors.red[700],
    },
    background: {
      default: colors.common.black,
    },
    divider: colors.common.white,
  },
  
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "transparent",
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            minHeight: 12,
            border: "1px solid #2b2b2b",
            background: "#2b2b2b"
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            border: "1px solid #2b2b2b",

          },
          "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
            border: "1px solid #2b2b2b",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            border: "2px solid grey",
          },
          "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
            border: "2px solid white",
          },
        },
      }
    },
    
    MuiListItemText: {
      styleOverrides: {
        
        root: {
          ":focus": {
            color: "white"
          },
          
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          "& .MuiSvgIcon-root": { fontSize: 24, margin: "auto" },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          "&:hover": {
            "background-color": "transparent",
          },
        
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
         padding: "2px 4px"
        }
      },
    },
  },
});

const JomoBoxShadow =
  '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';

const JomoSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#0a84ff' : '#007bff',
  height: 4,
  padding: '15px 0',
  '& .MuiSlider-thumb': {
    height: 4,
    width: 4,
    backgroundColor: '#fff',
    boxShadow: '0 0 2px 0px rgba(0, 0, 0, 0.1)',
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: '0px 0px 3px 1px rgba(0, 0, 0, 0.1)',
      height: 8,
      width: 8,
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        boxShadow: JomoBoxShadow,
      },
    },
    '&:before': {
      boxShadow:
        '0px 0px 1px 0px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 0px 1px 0px rgba(0,0,0,0.12)',
    },
  },
  '& .MuiSlider-valueLabel': {
    fontSize: 12,
    fontWeight: 'normal',
    top: -6,
    backgroundColor: 'unset',
    color: theme.palette.text.primary,
    '&::before': {
      display: 'none',
    },
    '& *': {
      background: 'transparent',
      color: theme.palette.mode === 'dark' ? '#fff' : '#000',
    },
  },
  '& .MuiSlider-track': {
    border: 'none',
    height: 5,
    color: "green"
  },
  '& .MuiSlider-rail': {
    opacity: 0.5,
    boxShadow: 'inset 0px 0px 4px -2px #000',
    backgroundColor: theme.palette.background
  },
}));

const JomoAppSearch = styled(TextField)(({ theme }) => ({
  
  "& .MuiOutlinedInput-root": {
    borderRadius: "36px",
    border: "none",
    backgroundColor: "#242424",
    "& fieldset": {
      border: "none",
      outline: "none"
    },
    "&:hover fieldset": {
      border: "1px solid grey",
    },
    "&.Mui-focused fieldset": {
      border: "2px solid white",
    },
  },
  
}));

export{ homeTheme as default, JomoSlider, JomoAppSearch};
