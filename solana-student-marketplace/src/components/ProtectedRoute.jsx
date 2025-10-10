import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const wallet = localStorage.getItem("wallet_address");
    setIsAuthenticated(wallet && wallet.trim().length > 20);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="text-center mt-20 text-gray-400">
        Checking wallet connection...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
