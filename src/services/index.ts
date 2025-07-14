// Main entry point for all services
export * from "./solana";
export * from "./account";
export * from "./memo";
export * from "./system";

// Legacy/convenience exports
export * from "./real-program-interactions";

// Re-export commonly used functions from all services
export {
  // Memo services
  sendMemoMessage,
  validateMemoMessage,
  getMemoProgram,
  useMemoService,
} from "./memo";

export {
  // System services
  transferSol,
  createDataAccount,
  getAccountBalance,
  validateSolAmount,
} from "./system";

export {
  // Account services
  readAccountData,
  checkAccountExists,
  getAccountTransactions,
  isValidPublicKey,
  useAccountService,
} from "./account";

export {
  // Solana constants and types
  SOLANA_PROGRAMS,
  SOLANA_EXPLORER_BASE_URL,
  CLUSTER,
} from "./solana";

export {
  // Real program interactions (legacy)
  useRealProgramInteractions,
  REAL_PROGRAMS,
} from "./real-program-interactions";
