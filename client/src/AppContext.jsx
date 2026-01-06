import { createContext } from "react";

const AppContext = createContext({
  user: null,
  appData: {},
  setUser: () => {},
  setAppData: () => {},
  currentPage: "announcements",
  setCurrentPage: () => {},
});

export default AppContext;
