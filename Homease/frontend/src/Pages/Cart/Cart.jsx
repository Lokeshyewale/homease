import React, { useContext, useEffect } from "react";
import "./Cart.css";
import { StoreContext } from "../../Components/context/storeContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const {
    cartItems,
    service_list,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to sign-up page if the user is not logged in
    if (!token) {
      alert("Please sign up or log in before accessing the cart.");
      navigate("/auth");
    }
  }, [token, navigate]);

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-item-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {service_list.map((item, index) => {
          if (cartItems[item._id || item.id] > 0) {
            return (
              <div key={index}>
                <div className="cart-item-title cart-items-item">
                  <img src={url + "/images/" + item.image} alt="" />
                  <p>{item.name}</p>
                  <p>Rs.{item.price}</p>
                  <p>{cartItems[item._id || item.id]}</p>
                  <p>Rs.{item.price * cartItems[item._id || item.id]}</p>
                  <p onClick={() => removeFromCart(item._id || item.id)} className="cross">
                    x
                  </p>
                </div>
                <hr />
              </div>
            );
          }
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>Rs. {getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Service charges</p>
              <p>Rs. {getTotalCartAmount() === 0 ? 0 : 200}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>
                Rs.{" "}
                {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 200}
              </b>
            </div>
          </div>
          <button onClick={() => navigate("/order")}>
            PROCEED TO CHECKOUT
          </button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="Promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
