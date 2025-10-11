import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { connectWallet, getWalletBalance, disconnectWallet } from "../lib/wallet";

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

  useEffect(() => {
    const address = localStorage.getItem("wallet_address");
    if (address) {
      setFormData((prev) => ({ ...prev, wallet_address: address }));
      fetchBalance(address);
    }
  }, []);

  const fetchBalance = async (address) => {
    try {
      const bal = await getWalletBalance(address);
      if (bal !== null) setBalance(bal.toFixed(3));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setBalance(null);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // ✅ Updated to properly get public URL
  const uploadFile = async (file) => {
    if (!file) return null;
    try {
      const filePath = `student-ids/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("student-ids").upload(filePath, file);
      if (error) throw error;

      const { publicUrl } = supabase.storage.from("student-ids").getPublicUrl(filePath);
      console.log("Uploaded file URL:", publicUrl);
      return publicUrl;
    } catch (err) {
      console.error("File upload error:", err);
      throw new Error("Failed to upload file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!formData.wallet_address) {
        setMessage("Please connect your wallet first.");
        setLoading(false);
        return;
      }

      if (!formData.student_id) {
        setMessage("Please upload your student ID.");
        setLoading(false);
        return;
      }

      if (formData.student_id.size > 2 * 1024 * 1024) {
        setMessage("File too large. Max size 2MB.");
        setLoading(false);
        return;
      }

      console.log("Form Data before registration:", formData);

      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", formData.wallet_address)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (existingUser) {
        setMessage("Welcome back! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1000);
        return;
      }

      // Upload student ID
      const student_id_url = await uploadFile(formData.student_id);
      if (!student_id_url) throw new Error("Failed to upload student ID.");

      // ✅ Upsert user
      const { data, error } = await supabase.from("users").upsert(
        {
          name: formData.name,
          email: formData.email,
          school: formData.school,
          wallet_address: formData.wallet_address,
          student_id_url,
          verified: false,
        },
        { onConflict: ["wallet_address"] }
      );

      console.log("Upsert data:", data);
      console.log("Upsert error:", error);

      if (error) throw error;

      setMessage("Registration successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1000);

      // Reset form
      setFormData({
        name: "",
        email: "",
        school: "",
        wallet_address: "",
        student_id: null,
      });
      setBalance(null);
      localStorage.removeItem("wallet_address");
    } catch (err) {
      console.error("Registration error:", err);
      setMessage(err.message?.includes("duplicate") ? "This wallet is already registered." : "Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      const address = await connectWallet();
      if (address) {
        setFormData((prev) => ({ ...prev, wallet_address: address }));
        fetchBalance(address);
        localStorage.setItem("wallet_address", address);
      } else {
        setMessage("Failed to connect wallet. Make sure your wallet extension is installed.");
      }
    } catch (err) {
      console.error("Wallet connect error:", err);
      setMessage("Failed to connect wallet. Check console for details.");
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (err) {
      console.error("Wallet disconnect error:", err);
    } finally {
      setFormData((prev) => ({ ...prev, wallet_address: "" }));
      setBalance(null);
      localStorage.removeItem("wallet_address");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <form
        onSubmit={handleSubmit}
        className={`max-w-md w-full p-8 rounded-2xl bg-[#131313]/70 border border-white/10 shadow-[0_0_15px_rgba(0,255,163,0.2)] backdrop-blur-lg ${
          loading ? "opacity-60 pointer-events-none" : ""
        }`}
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

          <div className="mb-3">
            {!formData.wallet_address ? (
              <button
                type="button"
                onClick={handleWalletConnect}
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
                    onClick={handleWalletDisconnect}
                    className="text-xs text-[#DC1FFF] hover:text-red-400 ml-3"
                  >
                    Disconnect
                  </button>
                </div>

                {balance !== null && (
                  <p className="text-xs text-gray-400 mt-1">
                    Balance: <span className="text-[#00FFA3]">{balance} SOL</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <label className="text-sm text-gray-400 block">Upload Student ID</label>
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

          {message && <p className="text-center mt-4 text-sm text-gray-300">{message}</p>}
        </div>
      </form>
    </div>
  );
}