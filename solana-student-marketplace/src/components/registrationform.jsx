import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { connectWallet } from "../lib/wallet"; //  fixed import path
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    school: "",
    wallet_address: "",
    student_id: null,
  });
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Automatically check wallet connection on page load
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.solana && window.solana.isPhantom) {
        try {
          const res = await window.solana.connect({ onlyIfTrusted: true });
          if (res.publicKey) {
            const address = res.publicKey.toString();
            setFormData((prev) => ({ ...prev, wallet_address: address }));
            getWalletBalance(address);
            localStorage.setItem("wallet_address", address); //  save wallet for route protection
          }
        } catch (err) {
          console.log("No wallet connected:", err);
        }
      }
    };

    checkWalletConnection();
  }, []);

  //  Fetch wallet balance
  const getWalletBalance = async (address) => {
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const publicKey = new PublicKey(address);
      const balanceInLamports = await connection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / 1_000_000_000;
      setBalance(balanceInSOL.toFixed(3));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setBalance(null);
    }
  };

  //  Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // Upload file to Supabase storage
  const uploadFile = async (file) => {
    const filePath = `student-ids/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("student-ids")
      .upload(filePath, file);

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from("student-ids")
      .getPublicUrl(filePath);

    return publicData.publicUrl; // ✅ fixed destructuring
  };

  //  Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // ✅ Wallet connection check
      if (!formData.wallet_address) {
        setMessage("Please connect your wallet first.");
        setLoading(false);
        return;
      }

      // ✅ Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", formData.wallet_address)
        .single();

      if (existingUser) {
        setMessage("Welcome back! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500);
        setLoading(false);
        return;
      }

      const student_id_url = await uploadFile(formData.student_id);

      // ✅ Use upsert instead of insert to prevent duplicate (409 conflict)
      const { error } = await supabase
        .from("users")
        .upsert(
          {
            name: formData.name,
            email: formData.email,
            school: formData.school,
            wallet_address: formData.wallet_address,
            student_id_url,
            verified: false,
          },
          { onConflict: ["email", "wallet_address"] }
        );

      if (error) throw error;

      // Success
      setMessage(" Registration successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);

      setFormData({
        name: "",
        email: "",
        school: "",
        wallet_address: "",
        student_id: null,
      });
    } catch (err) {
      console.error(err);
      setMessage(" Error registering. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <form
        onSubmit={handleSubmit}
        className={`max-w-md w-full p-8 rounded-2xl bg-[#131313]/70 border border-white/10 shadow-[0_0_15px_rgba(0,255,163,0.2)] backdrop-blur-lg ${
          loading ? "opacity-60 pointer-events-none" : ""
        }`} // ✅ disable during submit
      >
        <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] bg-clip-text text-transparent">
          Student Registration
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            value={formData.name}
            required
            className="w-full p-3 rounded bg-[#0A0B0D]/60 border border-white/10 text-white focus:outline-none focus:border-[#00FFA3]"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={formData.email}
            required
            className="w-full p-3 rounded bg-[#0A0B0D]/60 border border-white/10 text-white focus:outline-none focus:border-[#DC1FFF]"
          />

          <input
            type="text"
            name="school"
            placeholder="School Name"
            onChange={handleChange}
            value={formData.school}
            required
            className="w-full p-3 rounded bg-[#0A0B0D]/60 border border-white/10 text-white focus:outline-none focus:border-[#9945FF]"
          />

          {/* Wallet connect section */}
          <div className="mb-3">
            {!formData.wallet_address ? (
              <button
                type="button"
                onClick={async () => {
                  const address = await connectWallet();
                  if (address) {
                    setFormData((prev) => ({
                      ...prev,
                      wallet_address: address,
                    }));
                    getWalletBalance(address);
                    localStorage.setItem("wallet_address", address); //  store for route protection
                  }
                }}
                className="w-full py-2 rounded font-semibold text-black bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] hover:opacity-90 transition"
              >
                Connect Wallet
              </button>
            ) : (
              <div>
                <div className="flex items-center justify-between bg-[#0A0B0D]/60 border border-[#00FFA3]/30 rounded p-2 text-sm text-gray-200">
                  <span className="truncate">
                    Connected:{" "}
                    <span className="text-[#00FFA3] font-mono">
                      {formData.wallet_address.slice(0, 6)}...
                      {formData.wallet_address.slice(-4)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        wallet_address: "",
                      }));
                      localStorage.removeItem("wallet_address"); // clear on disconnect
                    }}
                    className="text-xs text-[#DC1FFF] hover:text-red-400 ml-3"
                  >
                    Disconnect
                  </button>
                </div>

                {balance !== null && (
                  <p className="text-xs text-gray-400 mt-1">
                    Balance:{" "}
                    <span className="text-[#00FFA3]">{balance} SOL</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <label className="text-sm text-gray-400 block">
            Upload Student ID
          </label>
          <input
            type="file"
            name="student_id"
            accept="image/*"
            onChange={handleChange}
            required
            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#00FFA3] file:via-[#DC1FFF] file:to-[#9945FF] file:text-black hover:file:opacity-90"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded font-semibold text-black bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#9945FF] hover:opacity-90 transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>
<div className="text-center mt-4 text-sm text-gray-400">
  Already registered?{" "}
  <a
    href="/login"
    className="text-[#00FFA3] hover:text-[#DC1FFF] transition font-medium"
  >
    Go to Login
  </a>
</div>

          {message && (
            <p className="text-center mt-4 text-sm text-gray-300">{message}</p>
          )}
        </div>
      </form>
    </div>
  );
}
