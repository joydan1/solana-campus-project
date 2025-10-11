// src/pages/dashboard.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import { buyProduct } from "../lib/product-buy.jsx"; // ✅ NEW import

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Product",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const wallet = localStorage.getItem("wallet_address");

  useEffect(() => {
    if (!wallet) navigate("/");
    fetchItems();
  }, []);

  // Fetch all listings by the logged-in user
  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setItems(data);
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file) => {
    const filePath = `items/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("items")
      .upload(filePath, file);

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from("items")
      .getPublicUrl(filePath);
    return publicData.publicUrl;
  };

  // Handle new listing submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!form.image) {
      setMessage("Please select an image");
      setLoading(false);
      return;
    }

    try {
      const image_url = await uploadImage(form.image);

      const { error } = await supabase.from("listings").insert([
        {
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          category: form.category,
          image_url,
          wallet_address: wallet,
        },
      ]);

      if (error) throw error;

      setMessage("Item posted successfully!");
      setForm({
        title: "",
        description: "",
        price: "",
        category: "Product",
        image: null,
      });

      fetchItems();
    } catch (err) {
      console.error(err);
      setMessage("Error posting item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  // Handle deleting an item
  const handleDelete = async (itemId) => {
    const confirm = window.confirm("Are you sure you want to delete this item?");
    if (!confirm) return;

    try {
      const { error } = await supabase.from("listings").delete().eq("id", itemId);
      if (error) throw error;

      setMessage("Item deleted successfully!");
      fetchItems();
    } catch (err) {
      console.error(err);
      setMessage("Error deleting item. Please try again.");
    }
  };

  // ✅ Handle product purchase
  const handleBuyNow = async (item) => {
    const confirm = window.confirm(
      `Buy "${item.title}" for ${item.price} SOL?`
    );
    if (!confirm) return;

    try {
      setLoading(true);
      setMessage("Processing transaction...");

      const buyer = localStorage.getItem("wallet_address");
      const seller = item.wallet_address;
      const price = parseFloat(item.price);

      const tx = await buyProduct(buyer, seller, price, item.id);

      if (tx) {
        setMessage("Purchase successful!");
        fetchItems();
      } else {
        setMessage("Transaction failed.");
      }
    } catch (error) {
      console.error("Buy error:", error);
      setMessage("Error processing purchase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#0A0B0D] text-white">
      <Navbar className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] bg-clip-text text-transparent">
          Solana Student Marketplace
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem("wallet_address");
            navigate("/");
          }}
          className="px-4 py-2 text-sm rounded bg-[#DC1FFF] hover:bg-[#9945FF]"
        >
          Disconnect
        </button>
      </Navbar>

      {/* New Item Form */}
      <div className="max-w-2xl mx-auto bg-[#131313]/70 p-6 rounded-2xl border border-white/10 mb-8">
        <h2 className="text-xl font-semibold mb-4">List a New Item or Service</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Item Title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full p-3 rounded bg-[#0A0B0D]/60 border border-white/10 text-white focus:outline-none focus:border-[#00FFA3]"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full p-3 rounded bg-[#0A0B0D]/60 border border-white/10 text-white h-24 focus:outline-none focus:border-[#DC1FFF]"
          />

          <div className="flex gap-4">
            <input
              type="number"
              step="0.01"
              name="price"
              placeholder="Price (SOL)"
              value={form.price}
              onChange={handleChange}
              required
              className="flex-1 p-3 rounded bg-[#0A0B0D]/60 border border-white/10 text-white focus:outline-none focus:border-[#9945FF]"
            />
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="flex-1 p-3 rounded bg-[#0A0B0D]/60 border border-white/10 text-white"
            >
              <option>Product</option>
              <option>Service</option>
            </select>
          </div>

          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#00FFA3] file:via-[#DC1FFF] file:to-[#9945FF] file:text-black hover:file:opacity-90"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded font-semibold text-black bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] hover:opacity-90 transition"
          >
            {loading ? "Posting..." : "Post Item"}
          </button>

          {message && (
            <p className="text-center mt-4 text-sm text-gray-300">{message}</p>
          )}
        </form>
      </div>

      {/* Listings Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <p className="text-center text-gray-400 col-span-3">
            No listings yet. Post something!
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="relative bg-[#131313]/60 border border-white/10 rounded-xl overflow-hidden shadow-lg hover:shadow-[#00FFA3]/20 transition"
            >
              {item.sold && (
                <span className="text-red-500 font-bold absolute top-2 right-2">
                  SOLD
                </span>
              )}
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[#00FFA3] font-semibold">
                    {item.price} SOL
                  </span>
                  <span className="text-xs text-gray-500">{item.category}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Delete
                  </button>

                  <button
                    disabled={item.sold}
                    onClick={() => handleBuyNow(item)} // ✅ new event
                    className={`flex-1 py-2 rounded font-semibold text-black ${
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
          ))
        )}
      </div>
    </div>
  );
}