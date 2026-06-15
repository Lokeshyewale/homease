import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:8080";
  const [token, setToken] = useState("");
  const [service_list, setServiceList] = useState([]);

  const clearCart = async () => {
    setCartItems({});
    if (token) {
      await axios.post(`${url}/api/cart/clear`, {}, { headers: { token } });
    }
  };

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
    }
  };

  const getTotalCartAmount = () => {
    let total = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const info = service_list.find(
          (s) => (s._id || s.id) === item
        );
        if (info) total += info.price * cartItems[item];
      }
    }
    return total;
  };

  // ── NEW: Build services array for order payload ───────────────────────────
  // Returns [{ id, name, category, price, quantity }] for every item in cart.
  // This is what PlaceOrder sends to the backend so category is always present.
  const getCartServicesForOrder = () => {
    return Object.keys(cartItems)
      .filter((id) => cartItems[id] > 0)
      .map((id) => {
        const info = service_list.find((s) => (s._id || s.id) === id);
        return {
          id,
          name: info?.name || id,
          category: info?.category || "",   // ← category now included
          price: info?.price || 0,
          quantity: cartItems[id],
        };
      });
  };

  const fetchServiceList = async () => {
    const response = await axios.get(url + "/api/service/list");
    setServiceList(response.data.data);
  };

  const loadCartData = async (token) => {
    const response = await axios.post(
      url + "/api/cart/get", {}, { headers: { token } }
    );
    setCartItems(response.data.cartData);
  };

  useEffect(() => {
    async function loadData() {
      await fetchServiceList();
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        await loadCartData(localStorage.getItem("token"));
      }
    }
    loadData();
  }, []);

  const contextValue = {
    service_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getCartServicesForOrder,   // ← export the new helper
    url,
    token,
    setToken,
    clearCart,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;