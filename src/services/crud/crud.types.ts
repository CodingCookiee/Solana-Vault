import { PublicKey } from "@solana/web3.js";
import { SOLANA_PROGRAMS } from "../solana/constants";

/**
 * CRUD Program Types
 */

// Program constants
export const PROGRAM_ID = SOLANA_PROGRAMS.CRUD;

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
