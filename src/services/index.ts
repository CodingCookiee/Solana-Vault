// Main entry point for all services
export * from "./solana";
export * from "./account";
export * from "./memo";
export * from "./system";
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
  // CRUD services
  useCrudService,
  useUserCrudEntries,
  createCrudEntry,
  updateCrudEntry,
  deleteCrudEntry,
  getCrudEntry,
  getUserCrudEntries,
  validateCrudEntry,
  validateTitle,
  PROGRAM_ID as CRUD_PROGRAM_ID,
} from "./crud";
