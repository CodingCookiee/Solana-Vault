import { PublicKey } from "@solana/web3.js";

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

export interface TokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string | File;  // Can be a URL or a File object
  sellerFeeBasisPoints?: number;
}

export interface CreateTokenOptions {
  decimals?: number;
  metadata?: TokenMetadata;
}

export interface SolanaWallet {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  sendTransaction?: (
    transaction: any,
    connection: any,
    options?: any
  ) => Promise<string>;
}

export interface SplTokenServiceState {
  // Wallet info
  connected: boolean;
  publicKey: PublicKey | null;
  connecting: boolean;
  isReady: boolean;
}
