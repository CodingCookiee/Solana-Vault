import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";

export const SOLANA_PROGRAMS = {
  MEMO: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
  SYSTEM: new PublicKey("11111111111111111111111111111112"),
  TOKEN: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  ASSOCIATED_TOKEN: new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  ),
  DEX: new PublicKey("F7TehQFrx3XkuMsLPcmKLz44UxTWWfyodNLSungdqoRX"),
  CRUD: new PublicKey("3AbGPHrtwVsPZgJsaZp9pJoMCWisyjKLXHn53QejTMSC"),
};

export const SOLANA_EXPLORER_BASE_URL = "https://explorer.solana.com";

// Use Alchemy RPC URL from environment or fallback to default devnet
export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || "https://api.devnet.solana.com";

export const CLUSTER = "devnet";

// Connection instance with Alchemy RPC
export const connection = new Connection(SOLANA_RPC_URL, "confirmed");

// Commitment level for transactions
export const COMMITMENT_LEVEL = "confirmed";
