import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { connectWallet } from "../lib/wallet";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

export default function Login() {
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch balance
  const getWalletBalance = async (address) => {
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const publicKey = new PublicKey(address);
      const lamports = await connection.getBalance(publicKey);
      setBalance((lamports / 1_000_000_000).toFixed(3));
    } catch (err) {
      console.error("Balance fetch failed:", err);
      setBalance(null);
    }
  };

  // Handle wallet login
  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const address = await connectWallet();
      if (!address) throw new Error("Wallet not connected.");

      setWalletAddress(address);
      getWalletBalance(address);
      localStorage.setItem("wallet_address", address);

      // Check if wallet exists in Supabase
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", address)
        .single();

      if (error && error.code !== "PGRST116") throw error; // ignore "No rows" error

      if (user) {
        setMessage("✅ Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage("❌ No account found for this wallet. Please register first.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error connecting wallet. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#131313]/70 border border-white/10 shadow-[0_0_15px_rgba(0,255,163,0.2)] backdrop-blur-lg">
        <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] bg-clip-text text-transparent">
          Student Login
        </h2>

        {!walletAddress ? (
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded font-semibold text-black bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] hover:opacity-90 transition"
          >
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="bg-[#0A0B0D]/60 border border-[#00FFA3]/30 rounded p-3 text-sm text-gray-300">
            <p>
              Connected:{" "}
              <span className="text-[#00FFA3] font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </p>
            {balance && (
              <p className="text-xs text-gray-400 mt-1">
                Balance:{" "}
                <span className="text-[#00FFA3]">{balance} SOL</span>
              </p>
            )}
          </div>
        )}

        {message && (
          <p className="text-center mt-4 text-sm text-gray-300">{message}</p>
        )}

        <div className="text-center mt-6 text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link
            to="/"
            className="text-[#00FFA3] hover:text-[#DC1FFF] transition font-medium"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
