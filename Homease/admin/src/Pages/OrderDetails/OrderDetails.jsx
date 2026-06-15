// filepath: d:\Projects\Homease1\admin\src\Pages\OrderDetails\OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./OrderDetails.css";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/orders/${orderId}`
        );
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (!order) {
    return <p>Loading...</p>;
  }

  return (
    <div className="order-details">
      <h2>Order Details</h2>
      <p>
        <strong>Order ID:</strong> {order.orderId}
      </p>
      <p>
        <strong>Amount:</strong> ₹{order.amount}
      </p>
      <p>
        <strong>Status:</strong> {order.status}
      </p>
      <h3>Services</h3>
      <ul>
        {order.services.map((service, index) => (
          <li key={index}>
            {service._id.name} (Qty: {service.quantity})
          </li>
        ))}
      </ul>
      <h3>Customer Details</h3>
      <p>
        <strong>Name:</strong> {order.userDetails.firstName}{" "}
        {order.userDetails.lastName}
      </p>
      <p>
        <strong>Email:</strong> {order.userDetails.email}
      </p>
      <p>
        <strong>Address:</strong> {order.userDetails.street},{" "}
        {order.userDetails.city}, {order.userDetails.state},{" "}
        {order.userDetails.pincode}
      </p>
      <p>
        <strong>Phone:</strong> {order.userDetails.phone}
      </p>
    </div>
  );
};

export default OrderDetails;
