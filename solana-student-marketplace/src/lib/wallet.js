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
    const provider = window.solana || window.solflare || window.slope;
    if (!provider) {
      alert("No Solana wallet detected. Install Phantom, Solflare, or Slope.");
      window.open("https://phantom.app/", "_blank");
      return null;
    }

    const response = await provider.connect();
    const walletAddress = response.publicKey.toString();

    // Identify wallet type
    let walletType = "Unknown";
    if (provider.isPhantom) walletType = "Phantom";
    else if (provider.isSolflare) walletType = "Solflare";
    else if (provider.isSlope) walletType = "Slope";

    console.log(`Connected wallet: ${walletAddress} (${walletType})`);
    localStorage.setItem("wallet_address", walletAddress);
    localStorage.setItem("wallet_type", walletType);

    return walletAddress;
  } catch (error) {
    console.error("Wallet connection failed:", error);
    alert("Failed to connect wallet. Please try again.");
    return null;
  }
}

// Disconnect wallet
export async function disconnectWallet() {
  try {
    const provider = window.solana || window.solflare || window.slope;
    if (provider && provider.disconnect) {
      await provider.disconnect();
    }

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
    return balanceInLamports / 1_000_000_000; // SOL
  } catch (err) {
    console.error("Failed to fetch balance:", err);
    return null;
  }
}
