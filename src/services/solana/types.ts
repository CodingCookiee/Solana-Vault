export interface SolanaServiceResult {
  signature: string;
  success: boolean;
  error?: string;
  data?: any;
}

export interface AccountInfo {
  owner: string;
  lamports: number;
  dataLength: number;
  executable: boolean;
  rentEpoch: number;
  data?: string;
  explorerUrl: string;
}

export interface TransactionInfo {
  signature: string;
  slot: number;
  blockTime: number | null;
  confirmationStatus: string | null;
  err: any;
  explorerUrl: string;
}
