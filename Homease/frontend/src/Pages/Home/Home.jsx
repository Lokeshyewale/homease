import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Home.css";
import Header from "../../Components/Header/Header"; // Import Header component
import ExploreMenu from "../../Components/ExploreMenu/ExploreMenu"; // Import ExploreMenu
import ServiceDisplay from "../../Components/ServiceDisplay/ServiceDisplay"; // Import ServiceDisplay
import AppDownload from "../../Components/AppDownload/AppDownload"; // Import AppDownload

const Home = () => {
  const location = useLocation();
  const [notification, setNotification] = useState("");
  const [category, setCategory] = useState("All"); // Define category state

  useEffect(() => {
    if (location.state?.message) {
      setNotification(location.state.message);

      // Clear the notification after 5 seconds
      const timer = setTimeout(() => {
        setNotification("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div>
      {notification && (
        <div className="notification">
          <p>{notification}</p>
        </div>
      )}
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />
      <ServiceDisplay category={category} />
      <AppDownload />
    </div>
  );
};

export default Home;
