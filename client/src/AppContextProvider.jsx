import { useState } from "react";
import AppContext from "./AppContext";

export default function AppContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [appData, setAppData] = useState({});
  const [currentPage, setCurrentPage] = useState("announcements");
  const contextValue = {
    user,
    setUser,
    appData,
    setAppData,
    currentPage,
    setCurrentPage,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
