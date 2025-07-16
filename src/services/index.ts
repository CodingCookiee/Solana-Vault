// Main entry point for all services
export * from "./solana";
export * from "./account";
export * from "./memo";
export * from "./system";
export * from "./Defi";
export * from "./crud";

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
  // DeFi/DEX services
  useDexService,
  usePoolInfo,
  useUserBalance,
  initializeUser,
  buySol,
  sellSol,
  provideLiquidity,
  withdrawLiquidity,
  transferAsset,
  sendMessage,
  getPoolInfo,
  getUserBalance,
  getTradeQuote,
  PROGRAM_ID as DEX_PROGRAM_ID,
} from "./Defi";

export {
  // CRUD services
  useCrudService,
  useUserCrudEntries,
  useUserEntriesAccount,
  initializeUserEntries,
  createCrudEntry,
  updateCrudEntry,
  deleteCrudEntry,
  getCrudEntry,
  getUserCrudEntries,
  getUserEntriesAccountData,
  validateCrudEntry,
  validateTitle,
  getAnchorProgram,
  deriveUserEntriesPDA,
  isUserEntriesInitialized,
  PROGRAM_ID as CRUD_PROGRAM_ID,
} from "./crud";
