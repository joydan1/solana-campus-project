import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if wallet is connected
    const wallet = localStorage.getItem("wallet_address");

    if (wallet) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-400">
        Checking wallet connection...
      </div>
    );
  }

  // If not connected, redirect to registration
  if (!authenticated) return <Navigate to="/" />;

  // If connected, show the dashboard
  return children;
}
