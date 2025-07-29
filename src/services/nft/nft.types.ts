import { PublicKey } from "@solana/web3.js";

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  uri: string;
}

export interface CollectionMetadata {
  name: string;
  symbol: string;
  description: string;
  uri: string;
}

export interface CreateCollectionParams {
  name: string;
  symbol: string;
  description: string;
  uri: string;
}

export interface CreateNFTParams {
  name: string;
  symbol: string;
  description: string;
  uri: string;
  collectionMint?: PublicKey;
}

export interface CollectionDetails {
  mint: PublicKey;
  name: string;
  symbol: string;
  description: string;
  uri: string;
  creator: PublicKey;
  verified: boolean;
}

export interface NFTDetails {
  mint: PublicKey;
  name: string;
  symbol: string;
  description: string;
  uri: string;
  collection?: PublicKey;
  creator: PublicKey;
  verified: boolean;
}

export interface VerifyParams {
  nftMint: PublicKey;
  collectionMint: PublicKey;
  creator: PublicKey;
}

export interface TransactionResult {
  success: boolean;
  message?: string;
  error?: string;
}
