import React from "react";
import "./Footer.css";
import { assets } from "../../assets/frontend_assets/assets";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img className="logo" src={assets.logo} alt="Homease Logo" />
          <p>
            Homease connects you with trusted professionals for all your home service needs.
            Our vetted experts deliver quality services with convenience and reliability,
            helping you maintain a beautiful and functional living space without the hassle.
          </p>
          <div className="footer-social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img src={assets.facebook_icon} alt="Facebook" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <img src={assets.twitter_icon} alt="Twitter" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <img src={assets.linkedin_icon} alt="LinkedIn" />
            </a>
          </div>
        </div>
        <div className="footer-content-center">
          <h2>Quick Links</h2>
          <div className="footer-divider"></div>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="#explore-services">Our Services</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>Contact Us</h2>
          <div className="footer-divider"></div>
          <ul>
            <li className="contact-item">
              <i className="contact-icon phone-icon"></i>

            </li>
            <li className="contact-item">
              <i className="contact-icon email-icon"></i>
              yanmol1813@gmail.com
            </li>
            <li className="contact-item">
              <i className="contact-icon location-icon"></i>
              Department of Computer Science, AMU, Aligarh, India
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <hr />
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} Homease - Your Home Service Partner | All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
