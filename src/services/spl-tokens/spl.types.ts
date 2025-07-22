import { PublicKey } from "@solana/web3.js";

export interface CreateTokenForm {
  tokenName: string;
  symbol: string;
  metadata: string;
  amount: number;
  decimals: number;
}

export interface TokenInfo {
  mint: string;
  account: string;
  balance: number;
  decimals: number;
}

export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

export interface MintInfo {
  address: string;
  decimals: number;
  supply: number;
  mintAuthority: string | null;
  freezeAuthority: string | null;
}

export interface SplTokenServiceState {
  connected: boolean;
  publicKey: PublicKey | null;
  connecting: boolean;
  isReady: boolean;
}
