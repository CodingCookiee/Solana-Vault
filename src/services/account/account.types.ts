import { PublicKey } from "@solana/web3.js";

export interface AccountInfo {
  owner: string;
  lamports: number;
  dataLength: number;
  executable: boolean;
  rentEpoch: number | undefined;
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

export interface AccountExistsResult {
  exists: boolean;
  info?: AccountInfo;
}

export interface ProgramAccountInfo {
  pubkey: string;
  owner: string;
  lamports: number;
  dataLength: number;
  executable: boolean;
  explorerUrl: string;
}

export interface AccountRentInfo {
  balance: number;
  rentExemptMinimum: number;
  isRentExempt: boolean;
  dataSize: number;
}

export interface MultipleAccountsResult {
  accounts: (AccountInfo | null)[];
  errors: string[];
}

export interface AccountValidationResult {
  valid: boolean;
  error?: string;
}

export interface AccountSearchFilters {
  owner?: PublicKey;
  dataSize?: number;
  lamports?: {
    min?: number;
    max?: number;
  };
  executable?: boolean;
}

export interface AccountSubscriptionCallback {
  (accountInfo: AccountInfo | null): void;
}

export interface AccountSubscription {
  unsubscribe: () => void;
  accountAddress: string;
}
