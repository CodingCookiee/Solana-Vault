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
  useMemoService,
  
  // System
  transferSol,
  createDataAccount,
  useSystemService,
  
  // Account
  readAccountData,
  checkAccountExists,
  useAccountService,
  
  // Constants
  SOLANA_PROGRAMS,
} from "./memo";
