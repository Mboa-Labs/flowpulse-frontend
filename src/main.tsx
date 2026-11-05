import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth";
import { TachesProvider } from "./taches";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TachesProvider>
          <App />
        </TachesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
