import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../Components/context/storeContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const {
    getTotalCartAmount,
    service_list,   // ← we need this to look up category
    cartItems,
    clearCart,
  } = useContext(StoreContext);

  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    email: localStorage.getItem("userEmail") || "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    serviceDate: "",
  });

  const navigate = useNavigate();
  const subtotal = getTotalCartAmount();
  const charges  = subtotal === 0 ? 0 : 49;
  const total    = subtotal + charges;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const selected = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      alert("Please choose a future date.");
      e.target.value = "";
    } else {
      handleInputChange(e);
    }
  };

  // ── Build services WITH category by looking up service_list ───────────────
  const buildServicesPayload = () => {
    return Object.keys(cartItems)
      .filter((id) => cartItems[id] > 0)
      .map((id) => {
        // Find the full service object from service_list using the cart key (which is the service id)
        const info = service_list.find(
          (s) => String(s.id || s._id) === String(id)
        );

        console.log(`Cart item id: "${id}", matched service:`, info); // debug — remove later

        return {
          id:       id,
          name:     info?.name     || id,
          category: info?.category || "",   // ← THIS is what providers filter by
          price:    info?.price    || 0,
          quantity: cartItems[id],
        };
      });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    const services = buildServicesPayload();

    if (services.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Log so you can verify category is present before paying
    console.log("Services being sent to backend:", services);

    try {
      const { data } = await axios.post(
        "http://localhost:8080/api/orders/create-order",
        { amount: total }
      );

      const options = {
        key: "rzp_test_ckOaggIIemTmet",
        amount: data.amount * 100,
        currency: "INR",
        name: "Homease Services",
        description: "Service Booking Payment",
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              "http://localhost:8080/api/orders/verify-payment",
              {
                orderId:     data.id,
                paymentId:   response.razorpay_payment_id,
                amount:      total,
                userDetails,
                services,    // ← now includes category, name, price correctly
              }
            );

            console.log("Order saved:", verifyRes.data); // debug

            localStorage.setItem("userEmail", userDetails.email);

            alert(
              "Booking confirmed! 🎉\n\n" +
              "Your Start OTP will appear in My Orders once a provider accepts your job."
            );

            clearCart();
            navigate("/myorders");
          } catch (err) {
            console.error("Error saving order:", err);
            alert("Payment succeeded but order saving failed. Please contact support with payment ID: " +
              response.razorpay_payment_id);
          }
        },
        prefill: {
          name:    userDetails.firstName + " " + userDetails.lastName,
          email:   userDetails.email,
          contact: userDetails.phone,
        },
        theme: { color: "#6c63ff" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      alert("Could not initiate payment. Please try again.");
    }
  };

  return (
    <form className="place-order" onSubmit={handlePayment}>
      <div className="place-order-left">
        <p className="title">Service & Delivery Information</p>

        <div className="multi-field">
          <input type="text" name="firstName" value={userDetails.firstName}
            onChange={handleInputChange} placeholder="First Name" required />
          <input type="text" name="lastName" value={userDetails.lastName}
            onChange={handleInputChange} placeholder="Last Name" required />
        </div>

        <input type="email" name="email" value={userDetails.email}
          onChange={handleInputChange} placeholder="Email address" required />

        <input type="text" name="street" value={userDetails.street}
          onChange={handleInputChange} placeholder="Street / Area" required />

        <div className="multi-field">
          <input type="text" name="city" value={userDetails.city}
            onChange={handleInputChange} placeholder="City" required />
          <input type="text" name="state" value={userDetails.state}
            onChange={handleInputChange} placeholder="State" required />
        </div>

        <div className="multi-field">
          <input type="text" name="pincode" value={userDetails.pincode}
            onChange={handleInputChange} placeholder="Pincode" required />
          <input type="text" name="phone" value={userDetails.phone}
            onChange={handleInputChange} placeholder="Phone Number" required />
        </div>

        <label className="date-label">Select Service Date:</label>
        <input type="date" name="serviceDate" value={userDetails.serviceDate}
          onChange={handleDateChange} required />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Order Summary</h2>
          <div className="cart-total-details">
            <p>Subtotal</p><p>Rs. {subtotal}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Service Charges</p><p>Rs. {charges}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <b>Total</b><b>Rs. {total}</b>
          </div>
          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;

