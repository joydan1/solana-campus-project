// src/lib/product-buy.jsx
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { supabase } from "./supabaseClient";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export async function buyProduct(buyer, seller, price, itemId) {
  try {
    // --- 1 Ensure Phantom is connected ---
    const provider = window.solana;
    if (!provider || !provider.isPhantom) {
      alert("Phantom wallet not found. Please install or connect it.");
      return;
    }

    const buyerPubKey = provider.publicKey; // use Phantom's connected wallet
    const sellerPubKey = new PublicKey(seller);

    // --- 2 Create transaction ---
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: buyerPubKey,
        toPubkey: sellerPubKey,
        lamports: price * LAMPORTS_PER_SOL, // convert SOL to lamports
      })
    );

    // --- 3 Fetch and attach recent blockhash ---
    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = buyerPubKey;

    // --- 4 Let Phantom sign + send ---
    const signedTx = await provider.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(signature, "confirmed");

    console.log(`Transaction confirmed: ${signature}`);

    // --- 5 Update Supabase: mark product as sold ---
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

    console.log(` Transaction logged successfully for item ${itemId}`);
    alert(`Purchase successful!\nTransaction Signature:\n${signature}`);
    return signature;

  } catch (err) {
    console.error(" Transaction failed:", err);
    alert("Transaction failed. Please try again.");
    return null;
  }
}
