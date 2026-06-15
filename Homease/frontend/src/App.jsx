import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Home from "./Pages/Home/Home";
import Cart from "./Pages/Cart/Cart";
import PlaceOrder from "./Pages/PlaceOrder/PlaceOrder";
import Footer from "./Components/Footer/Footer";
// import { useSession } from "@descope/react-sdk";
import AuthPage from "./Pages/Auth/AuthPage"; // New authentication page
import MyOrders from "./Pages/MyOrders/MyOrders";
import Profile from "./Pages/Profile/Profile";

const App = () => {
  // const { isSessionLoading } = useSession();

  // if (isSessionLoading) return <p>Loading...</p>;

  return (
    <div className="app">
      
      <div style={{padding:'0, 100px'}}>
          <Navbar />
      </div>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<PlaceOrder />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth" element={<AuthPage />} />{" "}
        {/* Show authentication when user clicks "Sign Up" */}
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
