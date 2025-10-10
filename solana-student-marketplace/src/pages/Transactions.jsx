import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Transactions({ wallet }) {
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) return;

    const fetchTransactions = async () => {
      // Fetch purchases
      const { data: purchasesData } = await supabase
        .from("transactions")
        .select("*, listings(title, price)")
        .eq("buyer_wallet", wallet)
        .order("created_at", { ascending: false });

      // Fetch sales
      const { data: salesData } = await supabase
        .from("transactions")
        .select("*, listings(title, price)")
        .eq("seller_wallet", wallet)
        .order("created_at", { ascending: false });

      setPurchases(purchasesData || []);
      setSales(salesData || []);
      setLoading(false);
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000);
  return () => clearInterval(interval);
  }, [wallet]);

  if (loading)
    return (
      <div className="text-center text-gray-400 mt-8">
        Loading transactions...
      </div>
    );

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Purchases */}
      <div className="bg-[#131313]/70 p-5 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-[#00FFA3] mb-3">
          🛒 My Purchases
        </h3>
        {purchases.length === 0 ? (
          <p className="text-gray-500 text-sm">No purchases yet.</p>
        ) : (
          <ul className="space-y-3">
            {purchases.map((tx) => (
              <li
                key={tx.id}
                className="bg-[#0A0B0D]/60 border border-[#00FFA3]/20 p-3 rounded-lg"
              >
                <p className="text-xs text-gray-400 mt-1">
  {new Date(tx.created_at).toLocaleString()}
</p>

                <p className="text-sm">
                  {tx.listings?.title || "Unnamed Item"} —{" "}
                  <span className="text-[#00FFA3]">{tx.amount} SOL</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tx:{" "}
                  <a
                    href={`https://explorer.solana.com/tx/${tx.tx_signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#00FFA3]/80 hover:text-[#00FFA3]"
                  >
                    View on Solscan
                  </a>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sales */}
      <div className="bg-[#131313]/70 p-5 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-[#DC1FFF] mb-3">
           My Sales
        </h3>
        {sales.length === 0 ? (
          <p className="text-gray-500 text-sm">No sales yet.</p>
        ) : (
          <ul className="space-y-3">
            {sales.map((tx) => (
              <li
                key={tx.id}
                className="bg-[#0A0B0D]/60 border border-[#DC1FFF]/20 p-3 rounded-lg"
              >
                <p className="text-sm">
                  {tx.listings?.title || "Unnamed Item"} —{" "}
                  <span className="text-[#DC1FFF]">{tx.amount} SOL</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tx:{" "}
                  <a
                    href={`https://explorer.solana.com/tx/${tx.tx_signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#DC1FFF]/80 hover:text-[#DC1FFF]"
                  >
                    View on Solscan
                  </a>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
