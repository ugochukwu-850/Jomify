import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.scss";
import AuthPage from "./components/AuthHome/index";
import { useEffect, useState } from "react";

import { StyledEngineProvider, ThemeProvider } from "@mui/material";

import themes from "./components/AuthHome/theme";
import { invoke } from "@tauri-apps/api/tauri";
import Home from "./components/Home";

function App() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    console.log("Running Effect in app component");

    let run_auth_status = async () => {
      try {
        let loginStatus: boolean = await invoke("is_authenticated");
        setLoggedIn(loginStatus);
      } catch (error) {
        console.log(error);
      }
    };

    run_auth_status();
  }, []);

  if (loggedIn === false) {
    return <AuthPage />;
  } else {
    return (
      <StyledEngineProvider injectFirst>
          <Home />
      </StyledEngineProvider>
    );
  }
}

export default App;
