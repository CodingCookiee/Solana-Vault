// Main entry point for all Solana services
export * from "./types";
export * from "./constants";

// Service exports
export * from "./memo";
export * from "./system";
export * from "./account";

// Convenience exports for commonly used functions
export {
  // Memo
  sendMemoMessage,
  validateMemoMessage,
  getMemoProgram,
  useMemoService,
} from "./memo";

export {
  // System
  transferSol,
  createDataAccount,
  getAccountBalance,
  validateSolAmount,
  useSystemService,
} from "./system";

export {
  // Account
  readAccountData,
  checkAccountExists,
  getAccountTransactions,
  isValidPublicKey,
  useAccountService,
} from "./account";

export {
  // Constants
  SOLANA_PROGRAMS,
  SOLANA_EXPLORER_BASE_URL,
  CLUSTER,
} from "./constants";
