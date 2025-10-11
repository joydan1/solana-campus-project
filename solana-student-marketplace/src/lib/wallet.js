import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

// Connect to Solana Devnet
export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Utility: Create a popup wallet selector
function createWalletPopup() {
  return new Promise((resolve) => {
    // Remove any existing popup
    const existing = document.getElementById("wallet-popup");
    if (existing) existing.remove();

    // Create popup container
    const popup = document.createElement("div");
    popup.id = "wallet-popup";
    popup.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;

    // Popup content
    const content = document.createElement("div");
    content.style.cssText = `
      background: #111;
      color: white;
      padding: 24px;
      border-radius: 16px;
      text-align: center;
      max-width: 300px;
      box-shadow: 0 0 20px rgba(0,255,163,0.4);
      border: 1px solid rgba(255,255,255,0.1);
    `;
    content.innerHTML = `
      <h3 style="margin-bottom:16px;font-size:1.2rem;">Select Wallet</h3>
      <button id="wallet-phantom" style="display:block;width:100%;margin-bottom:10px;padding:10px;background:#00FFA3;color:black;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Phantom</button>
      <button id="wallet-solflare" style="display:block;width:100%;margin-bottom:10px;padding:10px;background:#DC1FFF;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Solflare</button>
      <button id="wallet-slope" style="display:block;width:100%;margin-bottom:10px;padding:10px;background:#9945FF;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Slope</button>
      <button id="wallet-cancel" style="margin-top:10px;font-size:0.85rem;color:#aaa;background:none;border:none;cursor:pointer;">Cancel</button>
    `;

    popup.appendChild(content);
    document.body.appendChild(popup);

    // Button handlers
    document.getElementById("wallet-phantom").onclick = () => {
      popup.remove();
      resolve("Phantom");
    };
    document.getElementById("wallet-solflare").onclick = () => {
      popup.remove();
      resolve("Solflare");
    };
    document.getElementById("wallet-slope").onclick = () => {
      popup.remove();
      resolve("Slope");
    };
    document.getElementById("wallet-cancel").onclick = () => {
      popup.remove();
      resolve(null);
    };
  });
}

// Connect wallet (Phantom / Solflare / Slope)
export async function connectWallet() {
  try {
    const choice = await createWalletPopup();
    if (!choice) return null;

    let provider;
    let walletAddress = null;

    // Phantom
    if (choice === "Phantom" && window.solana?.isPhantom) {
      provider = window.solana;
      const response = await provider.connect();
      walletAddress = response.publicKey.toString();
    }

    // Solflare
    else if (choice === "Solflare" && window.solflare?.isSolflare) {
      provider = window.solflare;
      const response = await provider.connect();
      walletAddress = response.publicKey.toString();
    }

    // Slope
    else if (choice === "Slope" && window.Slope) {
      const slope = new window.Slope();
      const { data } = await slope.connect();
      if (data?.publicKey) walletAddress = data.publicKey;
      else {
        alert("Failed to connect to Slope wallet.");
        return null;
      }
    } else {
      alert(`${choice} wallet not detected. Please install it.`);
      return null;
    }

    if (!walletAddress) {
      alert("Connection failed. Try again.");
      return null;
    }

    console.log(`✅ Connected: ${walletAddress} (${choice})`);
    localStorage.setItem("wallet_address", walletAddress);
    localStorage.setItem("wallet_type", choice);

    return walletAddress;
  } catch (error) {
    console.error("❌ Wallet connection failed:", error);
    alert("Failed to connect wallet. Please check console for details.");
    return null;
  }
}

// Disconnect wallet
export async function disconnectWallet() {
  try {
    const walletType = localStorage.getItem("wallet_type");

    if (walletType === "Phantom" && window.solana?.disconnect) {
      await window.solana.disconnect();
    } else if (walletType === "Solflare" && window.solflare?.disconnect) {
      await window.solflare.disconnect();
    }
    // Slope doesn’t have a disconnect method; just clear session

    localStorage.removeItem("wallet_address");
    localStorage.removeItem("wallet_type");

    alert("Wallet disconnected successfully.");
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
  }
}

// Get wallet balance
export async function getWalletBalance(address) {
  try {
    if (!address) return null;
    const publicKey = new PublicKey(address);
    const balanceInLamports = await connection.getBalance(publicKey);
    return balanceInLamports / 1_000_000_000;
  } catch (err) {
    console.error("Failed to fetch balance:", err);
    return null;
  }
}