import React from "react";
import "./ExploreMenu.css";
import { menu_list } from "../../assets/frontend_assets/assets";

const ExploreMenu = ({ category, setCategory }) => {
  return (
    <div className="explore-services" id="explore-services">
      <div className="explore-services-header">
        <h1>Expert Services for Your Home</h1>
        <div className="section-divider"></div>
      </div>
      <p className="explore-services-text">
        Discover our comprehensive range of professional home services tailored to exceed your expectations.
        Each service is delivered by vetted professionals who bring expertise, reliability, and 
        exceptional craftsmanship to every project.
      </p>
      <div className="explore-services-list-container">
        <div className="explore-services-list">
          {menu_list.map((item, index) => {
            return (
              <div
                onClick={() =>
                  setCategory((prev) =>
                    prev === item.menu_name ? "All" : item.menu_name
                  )
                }
                key={index}
                className={`explore-services-list-item ${category === item.menu_name ? "active-item" : ""}`}
              >
                <div className="service-icon-container">
                  <img
                    className={category === item.menu_name ? "active" : ""}
                    src={item.menu_image}
                    alt={item.menu_name}
                  />
                </div>
                <p>{item.menu_name}</p>
                {category === item.menu_name && <span className="service-selected-indicator"></span>}
              </div>
            );
          })}
        </div>
      </div>
      {/* <div className="explore-services-cta">
        <p>Can't find what you need? We offer custom solutions too!</p>
        <button className="contact-btn">Contact Us</button>
      </div> */}
      <hr />
    </div>
  );
};

export default ExploreMenu;
