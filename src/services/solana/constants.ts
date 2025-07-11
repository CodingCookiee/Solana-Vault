import { PublicKey, SystemProgram } from "@solana/web3.js";

export const SOLANA_PROGRAMS = {
  MEMO: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
  SYSTEM: SystemProgram.programId,
  GUESTBOOK: new PublicKey("F7TehQFrx3XkuMsLPcmKLz44UxTWWfyodNLSungdqoRX"),
} as const;

export const CLUSTER = "devnet";
export const SOLANA_RPC_URL = `https://api.devnet.solana.com`;
export const SOLANA_EXPLORER_BASE_URL = "https://explorer.solana.com";