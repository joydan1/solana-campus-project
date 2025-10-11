import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { buyProduct } from "../lib/product-buy.jsx";
import Navbar from "../components/Navbar";

export default function ItemDetails() {
  const { id } = useParams(); // item id from URL
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch wallet on load
  useEffect(() => {
    const wallet = localStorage.getItem("wallet_address");
    if (wallet) setWalletAddress(wallet);
  }, []);

  // Fetch item
  useEffect(() => {
    async function fetchItem() {
      const { data: itemData, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !itemData) {
        console.error(error);
        alert("Item not found.");
        navigate("/marketplace");
        return;
      }
      setItem(itemData);
      setLoading(false);
    }
    fetchItem();
  }, [id, navigate]);

  // Handle buy
  const handleBuy = async () => {
    if (!walletAddress) {
      alert("Please connect your Phantom wallet first!");
      return;
    }
    const signature = await buyProduct(
      walletAddress,
      item.wallet_address,
      item.price,
      item.id
    );
    if (signature) {
      setItem({ ...item, sold: true });
    }
  };

  if (loading)
    return <p className="text-center mt-20 text-gray-400">Loading item...</p>;

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-[#131313]/70 rounded-2xl overflow-hidden shadow-lg p-6">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
          <p className="text-gray-400 mb-2">{item.description}</p>
          <p className="text-[#00FFA3] font-semibold mb-2">{item.price} SOL</p>
          <p className="text-xs text-gray-500 mb-4">{item.category}</p>

          <button
            onClick={handleBuy}
            disabled={item.sold}
            className={`w-full py-3 rounded font-semibold text-black ${
              item.sold
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] hover:opacity-90 transition"
            }`}
          >
            {item.sold ? "Sold" : "Buy Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
