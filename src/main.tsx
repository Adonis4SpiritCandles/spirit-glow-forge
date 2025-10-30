// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const spaBase =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/spiritcandles")
    ? "/spiritcandles"
    : "";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={spaBase}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

