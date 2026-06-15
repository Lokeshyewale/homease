import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ProviderContext = createContext();

const ProviderContextProvider = (props) => {
  const url = "http://localhost:8080";
  const [token, setToken] = useState("");
  const [providerData, setProviderData] = useState(null);

  const fetchProviderData = async (token) => {
    try {
      const response = await axios.get(`${url}/api/provider/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setProviderData(response.data);
      }
    } catch (error) {
      console.error("Error fetching provider data", error);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("providerToken");
    if (storedToken) {
      setToken(storedToken);
      fetchProviderData(storedToken);
    }
  }, []);

  const value = {
    url,
    token,
    setToken,
    providerData,
    setProviderData,
    fetchProviderData,
  };

  return (
    <ProviderContext.Provider value={value}>
      {props.children}
    </ProviderContext.Provider>
  );
};

export default ProviderContextProvider;
