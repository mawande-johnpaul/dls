import { useContext } from "react";
import AppContext from "../AppContext";
import Announcements from "./announcements";
import Tournaments from "./tournaments";
import Rules from "./rules";

export default function Content() {
  const { currentPage } = useContext(AppContext);
  return (
    <main>
      {currentPage == "announcements" ? (
        <Announcements />
      ) : currentPage == "tournaments" ? (
        <Tournaments />
      ) : currentPage == "rules" ? (
        <Rules />
      ) : (
        <>Null</>
      )}
    </main>
  );
}
