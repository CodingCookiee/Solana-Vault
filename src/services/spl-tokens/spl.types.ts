import { PublicKey } from "@solana/web3.js";

export interface CreateTokenForm {
  tokenName: string;
  symbol: string;
  description: string; // Add description field
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

export interface TokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  uri?: string;
}

export interface CreatedToken {
  mintAddress: string;
  name?: string;
  symbol?: string;
  description?: string; // Add description
  decimals: number;
  totalSupply: number;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  createdAt?: Date;
  metadata?: TokenMetadata;
  userBalance?: number;
  tokenAccount?: string;
  imageUrl?: string; // Add image URL
}

export interface TokenAllowance {
  owner: string;
  delegate: string;
  amount: number;
  mintAddress: string;
}

export interface ApproveTokensForm {
  delegateAddress: string;
  amount: number;
}

export interface SplTokenServiceState {
  connected: boolean;
  publicKey: PublicKey | null;
  connecting: boolean;
  isReady: boolean;
}
