import React from "react";
import "./Header.css";
import { assets } from "../../assets/frontend_assets/assets";

const Header = () => {
  return (
    <div className="header">
      <div className="header-contents">
        <h2>Professional Home Services at Your Fingertips</h2>
        <div className="header-divider"></div>
        <p>
          Welcome to Homease, your trusted partner for all home service needs.
        </p>
        <p>
          We connect you with verified professionals for cleaning, electrical work, 
          plumbing, relocation, painting, and repairs - all with just a few clicks. 
          Experience reliable, quality service delivery while you focus on what matters most.
        </p>
        <div className="header-buttons">
          <a href="#explore-services"><button className="primary-btn">Explore Services</button></a>
          <button className="secondary-btn">from here..</button>
        </div>
      </div>
    </div>
  );
};

export default Header;
