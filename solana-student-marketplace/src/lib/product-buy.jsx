// src/lib/product-buy.jsx
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { supabase } from "./supabaseClient";

// Connect to Solana Devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export async function buyProduct(buyer, seller, price, itemId) {
  try {
    // --- 1️⃣ Identify connected wallet provider dynamically ---
    const walletType = localStorage.getItem("wallet_type");
    let provider = null;

    if (walletType === "Phantom" && window.solana?.isPhantom) provider = window.solana;
    else if (walletType === "Solflare" && window.solflare?.isSolflare)
      provider = window.solflare;
    else if (walletType === "Slope" && window.slope?.isSlope)
      provider = window.slope;
    else provider = window.solana || window.solflare || window.slope;

    if (!provider) {
      alert("No wallet detected. Please connect Phantom, Solflare, or Slope.");
      return null;
    }

    // --- 2️⃣ Ensure connected ---
    if (!provider.publicKey) {
      await provider.connect();
    }

    const buyerPubKey = provider.publicKey;
    const sellerPubKey = new PublicKey(seller);

    // --- 3️⃣ Build transaction ---
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: buyerPubKey,
        toPubkey: sellerPubKey,
        lamports: price * LAMPORTS_PER_SOL,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = buyerPubKey;

    // --- 4️⃣ Request signing + sending ---
    const signedTx = await provider.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(signature, "confirmed");

    console.log(`✅ Transaction confirmed: ${signature}`);

    // --- 5️⃣ Mark as sold in Supabase ---
    const { error: updateError } = await supabase
      .from("listings")
      .update({ sold: true })
      .eq("id", itemId);

    if (updateError) throw updateError;

    // --- 6️⃣ Log transaction history ---
    const { error: logError } = await supabase.from("transactions").insert([
      {
        buyer_wallet: buyerPubKey.toBase58(),
        seller_wallet: seller,
        product_id: itemId,
        amount: price,
        signature: signature,
        created_at: new Date(),
      },
    ]);

    if (logError) throw logError;

    console.log(`Transaction logged for item ${itemId}`);
    alert(`Purchase successful!\nSignature: ${signature}`);

    return signature;
  } catch (err) {
    console.error("Transaction failed:", err);
    alert("Transaction failed. Please try again.");
    return null;
  }
}