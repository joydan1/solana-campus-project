import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "/pages/Dashboard";
import Marketplace from "/pages/Marketplace";
import RegistrationForm from "/components/RegistrationForm";
import ProtectedRoute from "/components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<RegistrationForm />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected marketplace */}
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
