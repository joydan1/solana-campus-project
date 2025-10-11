import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { buyProduct } from "../lib/product-buy.jsx";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { connectWallet } from "../lib/wallet";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: "All",
    sortBy: "Newest",
    minPrice: "",
    maxPrice: "",
  });
  const navigate = useNavigate();

  // Auto-detect wallet
  useEffect(() => {
    const storedWallet = localStorage.getItem("wallet_address");
    if (storedWallet) setWalletAddress(storedWallet);
    fetchListings();
  }, []);

  // Fetch listings
  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setItems(data || []);
    setLoading(false);
  };

  // Handle Buy
  const handleBuy = async (item) => {
    if (!walletAddress) {
      const address = await connectWallet();
      if (!address) return;
      setWalletAddress(address);
    }

    try {
      await buyProduct(walletAddress, item.wallet_address, item.price, item.id);
      fetchListings();
    } catch (err) {
      console.error("Buy failed:", err);
      alert("Transaction failed. Please try again.");
    }
  };

  // Filter & sort items
  const filteredItems = items
    .filter((item) => filter.category === "All" || item.category === filter.category)
    .filter((item) => (!filter.minPrice || item.price >= filter.minPrice))
    .filter((item) => (!filter.maxPrice || item.price <= filter.maxPrice))
    .sort((a, b) => {
      if (filter.sortBy === "PriceLow") return a.price - b.price;
      if (filter.sortBy === "PriceHigh") return b.price - a.price;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // Trending Items (3 newest)
  const trendingItems = [...items]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white p-6">
      <Navbar walletAddress={walletAddress} setWalletAddress={setWalletAddress} />

      {/* Trending Items */}
      {trendingItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🔥 Trending Items</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {trendingItems.map((item) => (
              <div
                key={item.id}
                className="min-w-[200px] bg-[#131313]/70 rounded-xl p-4 cursor-pointer hover:shadow-[#00FFA3]/30 transition"
                onClick={() => navigate(`/item/${item.id}`)}
              >
                <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover rounded mb-2" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-[#00FFA3]">{item.price} SOL</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          className="p-2 rounded bg-[#131313]/60 text-white"
        >
          <option value="All">All Categories</option>
          <option value="Product">Product</option>
          <option value="Service">Service</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={filter.minPrice}
          onChange={(e) => setFilter({ ...filter, minPrice: e.target.value })}
          className="p-2 rounded bg-[#131313]/60 text-white w-24"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={filter.maxPrice}
          onChange={(e) => setFilter({ ...filter, maxPrice: e.target.value })}
          className="p-2 rounded bg-[#131313]/60 text-white w-24"
        />

        <select
          value={filter.sortBy}
          onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
          className="p-2 rounded bg-[#131313]/60 text-white"
        >
          <option value="Newest">Newest</option>
          <option value="PriceLow">Price Low→High</option>
          <option value="PriceHigh">Price High→Low</option>
        </select>
      </div>

      {/* Items Grid */}
      {loading ? (
        <p className="text-center text-gray-400">Loading items...</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-center text-gray-400">No items available.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#131313]/70 border border-white/10 rounded-xl overflow-hidden shadow-lg hover:shadow-[#00FFA3]/20 transition cursor-pointer"
              onClick={() => navigate(`/item/${item.id}`)}
            >
              <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[#00FFA3] font-semibold">{item.price} SOL</span>
                  <span className="text-xs text-gray-500">{item.category}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuy(item);
                  }}
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
