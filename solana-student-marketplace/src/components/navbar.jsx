import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { connectWallet, disconnectWallet } from "../lib/wallet";

export default function Navbar() {
  const [walletAddress, setWalletAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const wallet = localStorage.getItem("wallet_address");
    if (wallet) setWalletAddress(wallet);
  }, []);

  const handleConnect = async () => {
    const address = await connectWallet();
    if (address) setWalletAddress(address);
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setWalletAddress("");
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-[#131313]/80 backdrop-blur-md rounded-xl mb-6">
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/marketplace")}>
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] bg-clip-text text-transparent">
          Solana Student Marketplace
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="text-white px-3 py-1 rounded hover:bg-[#00FFA3]/20 transition">Dashboard</Link>
        <Link to="/marketplace" className="text-white px-3 py-1 rounded hover:bg-[#DC1FFF]/20 transition">Marketplace</Link>

        {walletAddress ? (
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 text-sm rounded bg-[#DC1FFF] hover:bg-[#9945FF] transition"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="px-4 py-2 text-sm rounded bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] hover:opacity-80 transition"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
