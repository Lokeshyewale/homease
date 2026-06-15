import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import StoreContextProvider from "./Components/context/storeContext.jsx";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import 'bootstrap/dist/css/bootstrap.min.css';
// import { AuthProvider } from "@descope/react-sdk";

// Create a simple reducer for now
const initialState = {
  orders: [],
  loading: false,
  error: null
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

// Configure the Redux store
const store = configureStore({
  reducer: rootReducer
});

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      {/* <AuthProvider projectId="P2uAdkoJmtbNNqL0EN7we3djMjV6"> */}
      <StoreContextProvider>
        <App />
      </StoreContextProvider>
      {/* </AuthProvider> */}
    </BrowserRouter>
  </Provider>
);
