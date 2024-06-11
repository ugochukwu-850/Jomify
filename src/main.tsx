import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import OAuthCallback from "./components/AuthHome/OAuthCallback";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" Component={App} />
        <Route path="/callback" Component={OAuthCallback} />
      </Routes>
    </Router>
  // </React.StrictMode>
);
