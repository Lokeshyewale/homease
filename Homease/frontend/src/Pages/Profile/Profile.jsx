import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../Components/context/storeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: localStorage.getItem('userEmail') || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    // Fetch user profile data if we have a backend endpoint for it
    // For now, just load from localStorage
    loadUserData();
    fetchUserOrders();
  }, [token]);

  const loadUserData = () => {
    // In a real app, you'd fetch this from the backend
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserProfile(prev => ({
        ...prev,
        email: savedEmail
      }));
    }
    setLoading(false);
  };

  const fetchUserOrders = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) return;

      const response = await axios.get(`http://localhost:8080/api/orders/user/${email}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    try {
      // In a real app, you would update the user profile in the backend
      // For now, just save to localStorage
      localStorage.setItem('userEmail', userProfile.email);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="profile-loading">Loading your profile...</div>;
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-grid">
        <div className="profile-section">
          <div className="profile-header">
            <h3>Personal Information</h3>
            <button
              className="edit-button"
              onClick={toggleEdit}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <form onSubmit={saveProfile}>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={userProfile.firstName}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={userProfile.lastName}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={userProfile.email}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={userProfile.phone}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Street</label>
                <input
                  type="text"
                  name="street"
                  value={userProfile.street}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={userProfile.city}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={userProfile.state}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={userProfile.pincode}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button type="submit" className="save-button">Save Changes</button>
              </div>
            )}
          </form>

          <div className="logout-section">
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="recent-orders-section">
          <h3>Recent Orders</h3>

          {orders.length === 0 ? (
            <p>You don't have any orders yet.</p>
          ) : (
            <div className="recent-orders-list">
              {orders.slice(0, 5).map(order => (
                <div key={order._id} className="order-card-small">
                  <div className="order-header-small">
                    <span>Order #{order.orderId}</span>
                    <span className={`order-status-small ${order.trackingStatus}`}>
                      {order.trackingStatus.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="order-details-small">
                    <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                    <p><strong>Amount:</strong> ₹{order.amount}</p>
                  </div>
                  <button onClick={() => navigate('/my-orders')}>View Details</button>
                </div>
              ))}

              {orders.length > 5 && (
                <div className="view-all">
                  <button onClick={() => navigate('/my-orders')}>View All Orders</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 