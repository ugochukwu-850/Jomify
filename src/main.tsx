import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AuthPage from "./components/AuthHome";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" Component={App} />
        <Route path="/callback" Component={AuthPage} />
      </Routes>
    </Router>
  </React.StrictMode>
);
