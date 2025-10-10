import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

// Connect to Solana Devnet
export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export async function connectWallet() {
  try {
    if (!window.solana || !window.solana.isPhantom) {
      alert("Please install the Phantom wallet to continue.");
      window.open("https://phantom.app/", "_blank");
      return;
    }

    const response = await window.solana.connect();
    const walletAddress = response.publicKey.toString();

    // ✅ Save to localStorage so ProtectedRoute can detect it
    localStorage.setItem("wallet_address", walletAddress);

    alert(`Wallet connected: ${walletAddress}`);
    return walletAddress;
  } catch (error) {
    console.error("Wallet connection failed:", error);
    alert("Failed to connect wallet. Please try again.");
    return null;
  }
}

export async function disconnectWallet() {
  try {
    if (window.solana && window.solana.disconnect) {
      await window.solana.disconnect();
    }

    // Remove wallet from localStorage
    localStorage.removeItem("wallet_address");

    alert("Wallet disconnected successfully.");
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
  }
}
