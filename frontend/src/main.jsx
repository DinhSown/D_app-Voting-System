import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { Web3Provider } from "./context/Web3Context";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Web3Provider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#16161f",
                color: "#e2e8f0",
                border: "1px solid #2a2a3e",
                fontFamily: "'Syne', sans-serif",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#0a0a0f" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#0a0a0f" } },
            }}
          />
        </Web3Provider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
