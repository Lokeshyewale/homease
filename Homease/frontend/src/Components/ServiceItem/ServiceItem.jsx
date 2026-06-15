import React, { useContext } from "react";
import "./ServiceItem.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../context/storeContext";

const ServiceItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, url } =
    useContext(StoreContext);
  return (
    <div className="service-card">
      <div className="service-image-container">
        <img
          className="service-image"
          src={url + "/images/" + image}
          alt={name}
        />
      </div>
      
      <div className="service-details">
        <h3 className="service-title">{name}</h3>
        
        <div className="service-rating">
          <img src={assets.rating_starts} alt="rating" />
        </div>
        
        <p className="service-description">{description}</p>
        
        <div className="service-card-footer">
          <p className="service-price">Rs. {price}</p>
          
          <div className="service-actions">
            {!cartItems[id] ? (
              <button 
                className="add-button"
                onClick={() => addToCart(id)}
              >
                <img src={assets.add_icon_white} alt="Add" />
              </button>
            ) : (
              <div className="counter-container">
                <button 
                  onClick={() => removeFromCart(id)}
                  className="counter-button"
                >
                  <img src={assets.remove_icon_red} alt="Remove" />
                </button>
                <span className="counter-quantity">{cartItems[id]}</span>
                <button 
                  onClick={() => addToCart(id)}
                  className="counter-button"
                >
                  <img src={assets.add_icon_green} alt="Add" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceItem;
