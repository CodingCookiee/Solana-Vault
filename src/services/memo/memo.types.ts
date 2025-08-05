import { SolanaServiceResult } from "../solana/types";

export interface MemoServiceResult extends SolanaServiceResult {
  data?: {
    message: string;
    explorerUrl: string;
  };
}

export interface MemoServiceConfig {
  cluster?: string;
}