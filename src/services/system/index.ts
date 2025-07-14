// Export all system-related functions and types
export * from "./system.service";

// Re-export commonly used functions for convenience
export {
  transferSol,
  createDataAccount,
  getAccountBalance,
  validateSolAmount,
  hasSufficientBalance,
} from "./system.service";

export { useSystemService } from "./system.hooks";
