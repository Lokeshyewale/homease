import React, { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/frontend_assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../context/storeContext";

const Navbar = () => {
  const [menu, setMenu] = useState("Home");
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="" className="logo" />
      </Link>

      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("Home")}
          className={menu === "Home" ? "active" : ""}
        >
          Home
        </Link>

        <a
          href="#explore-services"
          onClick={() => setMenu("Services")}
          className={menu === "Services" ? "active" : ""}
        >
          Services
        </a>

        <a
        href="http://localhost:5175"
         className={menu === "Provider" ? "active" : ""}
         onClick={() => setMenu("Provider")}
         >
         Become a Provider
         </a>

        <a
          href="#footer"
          onClick={() => setMenu("Contact Us")}
          className={menu === "Contact Us" ? "active" : ""}
        >
          Contact Us
        </a>

        <Link
          to="/my-orders"
          onClick={() => setMenu("My Orders")}
          className={menu === "My Orders" ? "active" : ""}
        >
          My Orders
        </Link>
      </ul>

      <div className="navbar-right">
        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {token ? (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="" />

            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate("/profile")}>
                <img src={assets.profile_icon} alt="" />
                <p>My Profile</p>
              </li>

              <li onClick={() => navigate("/my-orders")}>
                <img src={assets.bag_icon} alt="" />
                <p>My Orders</p>
              </li>

              <hr />

              <li onClick={handleLogout}>
                <img src={assets.logout_icon} alt="" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        ) : (
          <button onClick={() => navigate("/auth")}>Sign Up</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;