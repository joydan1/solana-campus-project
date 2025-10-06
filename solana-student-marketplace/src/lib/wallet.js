export async function connectWallet() {
  if (!window.solana) {
    alert("Phantom wallet not found! Please install it from https://phantom.app");
    return null;
  }

  try {
    const response = await window.solana.connect();
    const publicKey = response.publicKey.toString();
    return publicKey;
  } catch (err) {
    console.error("Wallet connection failed:", err);
    return null;
  }
}
