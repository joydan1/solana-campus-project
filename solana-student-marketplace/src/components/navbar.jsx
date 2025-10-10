import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const wallet = localStorage.getItem("wallet_address");

  const handleDisconnect = () => {
    localStorage.removeItem("wallet_address");
    navigate("/login");
  };

  return (
    <nav className="bg-[#131313]/80 text-white px-6 py-4 flex justify-between items-center border-b border-white/10 backdrop-blur-md">
      <h1
        onClick={() => navigate("/marketplace")}
        className="text-xl font-bold cursor-pointer bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] bg-clip-text text-transparent"
      >
        Solana Student Marketplace
      </h1>

      <div className="flex gap-6 items-center">
        <button
          onClick={() => navigate("/marketplace")}
          className="hover:text-[#00FFA3] transition"
        >
          Marketplace
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="hover:text-[#DC1FFF] transition"
        >
          Dashboard
        </button>

        {wallet ? (
          <button
            onClick={handleDisconnect}
            className="text-sm px-4 py-2 rounded bg-[#DC1FFF] hover:bg-[#9945FF] transition"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="text-sm px-4 py-2 rounded bg-[#00FFA3] hover:bg-[#14fba3]/80 transition"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
