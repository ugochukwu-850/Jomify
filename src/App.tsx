import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.scss";
import AuthPage from "./components/AuthHome/index";
import { useEffect, useState } from "react";

import { StyledEngineProvider } from "@mui/material";

import { invoke } from "@tauri-apps/api/tauri";
import Home from "./components/Home";

function App() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    console.log("Running Effect in app component");

    let run_auth_status = async () => {
      try {
        let loginStatus: boolean = await invoke("is_authenticated");
        console.log("Login statys", loginStatus);
        setLoggedIn(loginStatus);
      } catch (error) {
        setLoggedIn(true);
        console.log(error);
      }
    };

    run_auth_status();
  }, []);
  console.log(loggedIn);
  if (loggedIn === null) {
    return <>Loading</>
  }
  else if (loggedIn === false) {
    return <AuthPage />;
  } else {
    return (
      <StyledEngineProvider injectFirst>
        <Home/>
      </StyledEngineProvider>
    );
  }
}

export default App;
