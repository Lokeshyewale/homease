import React from "react";
import "./Navbar1.css";
import { assets } from "../../assets/assets";

const Navbar = () => {
  return (
    <div className="navbar" style={{padding:'0, 100px'}}>
      <div className="logo-box">
        <img className="logo" src={assets.logo} alt="Homeease Logo" />
      </div>
    </div>
  );
};

export default Navbar;
