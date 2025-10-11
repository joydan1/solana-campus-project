import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect } from "react";

export default function Navbar() {
  const { connected, publicKey } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (connected && publicKey) {
      localStorage.setItem("wallet_address", publicKey.toBase58());
    } else {
      localStorage.removeItem("wallet_address");
    }
  }, [connected, publicKey]);

  return (
    <nav className="flex justify-between items-center p-4 bg-[#131313]/80 backdrop-blur-md rounded-xl mb-6">
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => navigate("/marketplace")}
      >
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] bg-clip-text text-transparent">
          Solana Student Marketplace
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="text-white px-3 py-1 rounded hover:bg-[#00FFA3]/20 transition"
        >
          Dashboard
        </Link>
        <Link
          to="/marketplace"
          className="text-white px-3 py-1 rounded hover:bg-[#DC1FFF]/20 transition"
        >
          Marketplace
        </Link>

        {/* ✅ Modern wallet modal button */}
        <WalletMultiButton className="!bg-gradient-to-r !from-[#00FFA3] !via-[#DC1FFF] !to-[#9945FF] !text-white !font-medium !rounded-md !px-4 !py-2 !hover:opacity-90 transition" />
      </div>
    </nav>
  );
}