import {
  Connection,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";

// Connect to Solana Devnet
export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Multi-wallet connection
export async function connectWallet() {
  try {
    // Prompt user to choose wallet
    const choice = prompt(
      "Select wallet to connect:\n Phantom\n  Solflare\n Slope"
    );

    let provider;
    if (choice === "1") provider = window.solana;
    else if (choice === "2") provider = window.solflare;
    else if (choice === "3" && window.Slope) provider = new window.Slope();
    else {
      alert("Invalid choice or wallet not installed.");
      return null;
    }

    if (!provider) {
      alert("No Solana wallet detected. Install Phantom, Solflare, or Slope.");
      return null;
    }

    let walletAddress;
    let walletType = "Unknown";

    // 🔹 Phantom
    if (provider.isPhantom) {
      const response = await provider.connect();
      walletAddress = response.publicKey.toString();
      walletType = "Phantom";
    }

    // 🔹 Solflare
    else if (provider.isSolflare) {
      const response = await provider.connect();
      walletAddress = response.publicKey.toString();
      walletType = "Solflare";
    }

    // 🔹 Slope
    else if (choice === "3" && window.Slope) {
      const slope = provider;
      const { data } = await slope.connect();
      if (data?.publicKey) {
        walletAddress = data.publicKey;
        walletType = "Slope";
      } else {
        alert("Failed to connect to Slope wallet.");
        return null;
      }
    }

    if (!walletAddress) {
      alert("Connection failed. Try again.");
      return null;
    }

    console.log(`Connected wallet: ${walletAddress} (${walletType})`);
    localStorage.setItem("wallet_address", walletAddress);
    localStorage.setItem("wallet_type", walletType);

    return walletAddress;
  } catch (error) {
    console.error(" Wallet connection failed:", error);
    alert("Failed to connect wallet. Please try again.");
    return null;
  }
}

// Disconnect wallet
export async function disconnectWallet() {
  try {
    const walletType = localStorage.getItem("wallet_type");

    if (walletType === "Phantom" && window.solana?.disconnect)
      await window.solana.disconnect();
    else if (walletType === "Solflare" && window.solflare?.disconnect)
      await window.solflare.disconnect();
    else if (walletType === "Slope" && window.Slope)
      await new window.Slope().disconnect();

    localStorage.removeItem("wallet_address");
    localStorage.removeItem("wallet_type");

    alert("Wallet disconnected successfully.");
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
  }
}

// Fetch balance for a given wallet
export async function getWalletBalance(address) {
  try {
    if (!address) return null;
    const publicKey = new PublicKey(address);
    const balanceInLamports = await connection.getBalance(publicKey);
    return balanceInLamports / 1_000_000_000; // Convert lamports → SOL
  } catch (err) {
    console.error("Failed to fetch balance:", err);
    return null;
  }
}