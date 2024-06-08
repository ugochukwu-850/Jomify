import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.scss";
import AuthPage from "./components/AuthHome/index";
function App() {
  if (IsAuthVerified() === false) {
    return <AuthPage />;
  } else {
    return <></>;
  }
}

function IsAuthVerified() {
  return true;
}

export default App;
