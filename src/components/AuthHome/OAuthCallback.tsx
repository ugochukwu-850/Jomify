import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

const OAuthCallback = () => {
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
        location.href = "/";
      } catch (error) {
        console.log(error);
      }
    }

    console.log(data);
    handleCallback();

    return () => {};
  }, []);

  return (
    <>
    </>
  );
};

export default OAuthCallback;
