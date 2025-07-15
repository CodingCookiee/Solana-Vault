import { PublicKey } from "@solana/web3.js";

/**
 * CRUD Program Types
 */

// Program constants - use the address from your IDL
export const PROGRAM_ID = new PublicKey("3AbGPHrtwVsPZgJsaZp9pJoMCWisyjKLXHn53QejTMSC");

// Account types from IDL
export interface CrudEntryState {
  owner: PublicKey;
  title: string;
  message: string;
}

// Transaction result types
export interface CrudTransactionResult {
  signature: string;
  success: boolean;
  error?: string;
  explorerUrl?: string;
}

// CRUD operation types
export interface CreateCrudEntryParams {
  title: string;
  message: string;
}

export interface UpdateCrudEntryParams {
  title: string;
  message: string;
}

export interface DeleteCrudEntryParams {
  title: string;
}

// Service result type
export interface CrudServiceResult extends CrudTransactionResult {
  data?: CrudEntryState;
}

// Hook state types
export interface CrudHookState {
  entries: CrudEntryState[];
  loading: boolean;
  error: string | null;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  error?: string;
}