import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.scss";
import AuthPage from "./components/AuthHome/main";
import { useEffect, useState } from "react";

import { StyledEngineProvider } from "@mui/material";

import { invoke } from "@tauri-apps/api/tauri";
import Home from "./components/Home";
import { appWindow } from "@tauri-apps/api/window";

function App() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let run_auth_status = async () => {
      try {
        let loginStatus: boolean = await invoke("is_authenticated");
        console.log("Login statys", loginStatus);
        setLoggedIn(loginStatus);
      } catch (error) {
        setLoggedIn(false);
        console.log(error);
      }
    };

    run_auth_status();
  }, []);

  useEffect(() => {
    // use an effect to listen if the user has been authenticated by a backend process
    // if the event is called then set loggedin to true
    const StateLessAuthenticationCheck = async () => {
      // try and wait for the response
      try {
        console.log("Waiting for any user log update");

        let unlisten = await appWindow.listen<string>("authentication", (event) => {
          console.log(event.payload);
          if (event.payload == "loggedIn") {
            setLoggedIn(true);
          } else if (event.payload == "loggedOut") {
            setLoggedIn(false);
          }
        });
      } catch (error) {
        console.log(error);
      }
    };
    
    StateLessAuthenticationCheck();
  }, []);

  console.log(loggedIn);

  if (loggedIn) {
    return (
      <StyledEngineProvider injectFirst>
        <Home />
      </StyledEngineProvider>
    );
  } else if (loggedIn == null) {
    return <></>;
  } else {
    return <AuthPage />;
  }
}

export default App;
