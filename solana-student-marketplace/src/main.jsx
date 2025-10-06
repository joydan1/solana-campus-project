import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import Dashboard from "./pages.jsx";
import "./index.css";
import ProtectedRoute from "./components/ProtectedRoute.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
     <Routes>
  {/* Registration Page */}
  <Route path="/" element={<App />} />

  {/* Protected Dashboard */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  {/* Redirect unknown routes */}
  <Route path="*" element={<Navigate to="/" />} />
</Routes>

    </BrowserRouter>
  </React.StrictMode>
);
