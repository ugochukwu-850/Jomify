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

function App() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  let [data, setData] = useState<null | string>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // invoke the api to handle redirect
        let code: string | null = new URLSearchParams(location.search).get(
          "code"
        );
        let state: string | null = new URLSearchParams(location.search).get(
          "state"
        );

        if (!state || !code) {
          throw new Error("State or code was not found");
        }

        let data: string = await invoke("exchange_auth_code", {
          state: state,
          code: code,
        });

        setData(JSON.stringify(data));
      } catch (error) {
        console.log(error);
      }
    }

    console.log(data);
    handleCallback();

    return () => {};
  }, []);

  useEffect(() => {

    let run_auth_status = async () => {
      try {
        let loginStatus: boolean = await invoke("is_authenticated");
        console.log("Login statys", loginStatus);
        setLoggedIn(loginStatus);
      } catch (error) {
        console.log(error);
      }
    };

    run_auth_status();
  }, [data]);

  console.log(loggedIn);
  
  if (data || loggedIn) {
    return (
      <StyledEngineProvider injectFirst>
        <Home />
      </StyledEngineProvider>
    );
  } else {
    return <AuthPage />;
  }
}

export default App;
