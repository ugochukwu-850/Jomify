import { Chip, Divider, TextField } from "@mui/material";
import { styled, createTheme } from "@mui/material/styles";

const WhiteOutlinedTextField = styled(TextField)(({ theme }) => ({
  
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "white",
    },
    "&:hover fieldset": {
      borderColor: "white",
    },
    "&.Mui-focused fieldset": {
      borderColor: "white",
    },
  },
  
  "& .MuiInputLabel-root": {
    color: "white",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "white",
  },
  "& .Mui-focused.MuiFormHelperText-contained": {
    error: true,
    color: "white"
  }
}));
const WhiteOutlinedDivider = styled(Divider)(({ theme }) => ({
  "&.MuiDivider-root": {
    borderColor: "white",
  },
}));

const WhiteFilledChip = styled(Chip)(({ theme }) => ({
  color: "white",
  "& .MuiChip-label": {
    color: "white",
  },
  border:" 2px solid white"
}));

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#ffffff",
    },
  },
});

export default {
  customTheme,
  WhiteOutlinedTextField,
  WhiteOutlinedDivider,
  WhiteFilledChip,
};
