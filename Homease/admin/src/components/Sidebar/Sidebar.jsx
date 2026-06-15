import React from "react";
import "./Sidebar1.css";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <NavLink to="/add" className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Add Services</p>
        </NavLink>
        <NavLink to="/list" className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>List Services</p>
        </NavLink>
        <NavLink to="/orders" className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Orders</p>
        </NavLink>
        <NavLink to="/providers" className="sidebar-option">
          <img src={assets.profile_icon ? assets.profile_icon : assets.order_icon} alt="" />
          <p>Service Providers</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
