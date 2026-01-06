import {
  BrowserRouter as Router,
  Route,
  Routes,
  BrowserRouter,
} from "react-router-dom";
import "./App.css";
import Home from "./pages/home";
import AppContextProvider from "./AppContextProvider";

function App() {
  return (
    <AppContextProvider>
      <RouterComponent />
    </AppContextProvider>
  );
}

function RouterComponent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
