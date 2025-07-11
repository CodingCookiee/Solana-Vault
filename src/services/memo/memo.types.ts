import { SolanaServiceResult } from "@/services/index";

export interface MemoServiceResult extends SolanaServiceResult {
  data?: {
    message: string;
    explorerUrl: string;
  };
}

export interface MemoServiceConfig {
  cluster?: string;
}
