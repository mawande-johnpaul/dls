import { useContext, useEffect, useState } from "react";
import { fetchData } from "../api";
import AppContext from "../AppContext";
import { LoadingSkeleton } from "./loading";
import "../components/announcement.css";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentPage } = useContext(AppContext);

  useEffect(() => {
    setLoading(true);
    fetchData("announcements", "GET")
      .then((data) => {
        setAnnouncements(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching announcements:", error);
        setLoading(false);
      });
  }, []);

  const handleStartNow = () => {
    setCurrentPage("tournaments");
  };

  return (
    <div>
      <div className="banner">
        <video autoPlay loop muted className="banner-video">
          <source src="banner.mp4" type="video/mp4" />
        </video>
        <div className="banner-content">
          <h1>DLS Tournaments 2026</h1>
          <p>Join the challenge or support your favorite players!</p>
          <button onClick={handleStartNow}>Start now!</button>
        </div>
      </div>
      <div className="announcements">
        <h1>Announcements</h1>
        <div className="announcement-items">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="announcement">
                  <LoadingSkeleton type="title" count={1} />
                  <LoadingSkeleton type="text" count={3} />
                </div>
              ))}
            </>
          ) : announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div key={announcement.id} className="announcement">
                <h2>{announcement.title}</h2>
                <p>{announcement.content}</p>
                <small>
                  {new Date(announcement.created_at).toLocaleDateString()}
                </small>
              </div>
            ))
          ) : (
            <div className="announcement">
              <p>No announcements available at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
