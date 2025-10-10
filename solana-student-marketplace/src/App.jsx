import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/dashboard.jsx";
import Marketplace from "./pages/marketplace.jsx";
import RegistrationForm from "./components/registrationform.jsx";
import Login from "./components/login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<RegistrationForm />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <Marketplace />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirects to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
