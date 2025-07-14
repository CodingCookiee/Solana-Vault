import { PublicKey } from "@solana/web3.js";

export const SOLANA_PROGRAMS = {
  MEMO: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
  SYSTEM: new PublicKey("11111111111111111111111111111112"),
  TOKEN: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  ASSOCIATED_TOKEN: new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  ),
  DEX: new PublicKey("F7TehQFrx3XkuMsLPcmKLz44UxTWWfyodNLSungdqoRX"),
};

export const SOLANA_EXPLORER_BASE_URL = "https://explorer.solana.com";
export const SOLANA_RPC_URL = "https://api.devnet.solana.com";
export const CLUSTER = "devnet";
