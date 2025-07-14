// Export all account-related functions and types
export * from "./account.service";
export * from "./account.types";
export * from "./account.hooks";

// Re-export commonly used functions for convenience
export {
  readAccountData,
  checkAccountExists,
  getAccountTransactions,
  isValidPublicKey,
  getProgramAccounts,
  getMultipleAccountsData,
  getAccountRentInfo,
} from "./account.service";

export { useAccountService } from "./account.hooks";
