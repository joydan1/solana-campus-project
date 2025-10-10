import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { buyProduct } from "../lib/product-buy.jsx";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🪙 Auto-detect Phantom wallet
  useEffect(() => {
    async function checkWallet() {
      if (window.solana && window.solana.isPhantom) {
        try {
          const res = await window.solana.connect({ onlyIfTrusted: true });
          setWalletAddress(res.publicKey.toString());
        } catch (err) {
          console.log("Wallet not connected yet");
        }
      }
    }
    checkWallet();
    fetchListings();
  }, []);

  // 🧾 Fetch all listings
  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setItems(data);
    setLoading(false);
  };

  // 💰 Handle buy button click
  const handleBuy = async (item) => {
    if (!window.solana || !window.solana.isPhantom) {
      alert("Please install or connect Phantom wallet!");
      return;
    }

    try {
      const provider = window.solana;
      const { publicKey } = await provider.connect(); // ensure active wallet
      setWalletAddress(publicKey.toString());

      await buyProduct(
        publicKey.toBase58(),     // buyer (auto from Phantom)
        item.wallet_address,      // seller wallet from listing
        item.price,               // price in SOL
        item.id                   // listing ID
      );

      // Refresh UI
      fetchListings();
    } catch (err) {
      console.error("Buy failed:", err);
      alert("Transaction failed. Please try again.");
    }
  };

  return (
    
    <div className="min-h-screen bg-[#0A0B0D] text-white p-6">
      <Navbar className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] bg-clip-text text-transparent">
          Solana Student Marketplace
        </h1>

        {walletAddress ? (
          <button
            onClick={() => setWalletAddress("")}
            className="px-4 py-2 text-sm rounded bg-[#DC1FFF] hover:bg-[#9945FF]"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={async () => {
              const res = await window.solana.connect();
              setWalletAddress(res.publicKey.toString());
            }}
            className="px-4 py-2 text-sm rounded bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] hover:opacity-80"
          >
            Connect Wallet
          </button>
        )}
      </Navbar>

      {loading ? (
        <p className="text-center text-gray-400">Loading items...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-400">No items available yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#131313]/70 border border-white/10 rounded-xl overflow-hidden shadow-lg hover:shadow-[#00FFA3]/20 transition"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[#00FFA3] font-semibold">
                    {item.price} SOL
                  </span>
                  <span className="text-xs text-gray-500">{item.category}</span>
                </div>

                <button
                  onClick={() => handleBuy(item)}
                  disabled={item.sold}
                  className={`w-full mt-4 py-2 rounded font-semibold text-black ${
                    item.sold
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] hover:opacity-90 transition"
                  }`}
                >
                  {item.sold ? "Sold" : "Buy Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
