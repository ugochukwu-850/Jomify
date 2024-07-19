import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.scss";
import AuthPage from "./components/AuthHome/main";
import { createContext, useEffect, useState } from "react";

import { StyledEngineProvider } from "@mui/material";

import { invoke } from "@tauri-apps/api/tauri";
import Home from "./components/Home";
import { appWindow } from "@tauri-apps/api/window";
import { GlobalStateContext, GlobalStateContextController } from "./types";

export const GlobalState = createContext<
  GlobalStateContextController | undefined
>(undefined);
function App() {
  const [global_state, setGlobalState] = useState<GlobalStateContext>({
    logged_in: true,
  });

  useEffect(() => {
    let run_auth_status = async () => {
      try {
        console.log("Login sayss");
        let loginStatus: boolean = await invoke("is_authenticated");
        console.log("Login statys", loginStatus);
        setGlobalState({ ...global_state, logged_in: loginStatus });
      } catch (error) {
        setGlobalState({ ...global_state, logged_in: false });
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

        let unlisten = await appWindow.listen<string>(
          "authentication",
          (event) => {
            console.log(event.payload);
            if (event.payload == "loggedIn") {
              setGlobalState({ ...global_state, logged_in: true });
            } else if (event.payload == "loggedOut") {
              setGlobalState({ ...global_state, logged_in: false });
            }
          }
        );
      } catch (error) {
        console.log(error);
      }
    };

    StateLessAuthenticationCheck();
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <GlobalState.Provider value={{ global_state, setGlobalState }}>
        <Home />
      </GlobalState.Provider>
    </StyledEngineProvider>
  );
}

export default App;
