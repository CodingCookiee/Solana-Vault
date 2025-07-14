import {
  Connection,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN, Idl } from "@coral-xyz/anchor";
import { SOLANA_EXPLORER_BASE_URL, CLUSTER } from "../solana/constants";
import {
  PROGRAM_ID,
  CrudServiceResult,
  CreateCrudEntryParams,
  UpdateCrudEntryParams,
  DeleteCrudEntryParams,
  CrudEntryState,
  ValidationResult,
} from "./crud.types";

// Import IDL - Fixed import method
import crudIdlJson from "./crud.idl.json";
const crudIdl = crudIdlJson as unknown as Idl;

/**
 * Create a new CRUD entry
 */
export const createCrudEntry = async (
  connection: Connection,
  wallet: AnchorWallet,
  params: CreateCrudEntryParams
): Promise<CrudServiceResult> => {
  try {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });

    // Create program with proper error handling
    let program: Program;
    try {
      program = new Program(crudIdl, PROGRAM_ID, provider);
    } catch (programError) {
      console.error("Error creating program:", programError);
      throw new Error("Failed to initialize program");
    }

    // Derive PDA for the CRUD entry - using the correct seeds from IDL
    const [crudEntryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(params.title), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    // Check if entry already exists using connection.getAccountInfo
    const existingAccount = await connection.getAccountInfo(crudEntryPDA);
    if (existingAccount !== null) {
      return {
        signature: "",
        success: false,
        error: "Entry with this title already exists",
      };
    }

    // Use the correct instruction name from IDL
    const tx = await program.methods
      .createCrudEntry(params.title, params.message)
      .accounts({
        crudEntry: crudEntryPDA,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${tx}?cluster=${CLUSTER}`;

    return {
      signature: tx,
      success: true,
      explorerUrl,
    };
  } catch (error) {
    console.error("Error creating CRUD entry:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Update an existing CRUD entry
 */
export const updateCrudEntry = async (
  connection: Connection,
  wallet: AnchorWallet,
  params: UpdateCrudEntryParams
): Promise<CrudServiceResult> => {
  try {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });

    let program: Program;
    try {
      program = new Program(crudIdl, PROGRAM_ID, provider);
    } catch (programError) {
      console.error("Error creating program:", programError);
      throw new Error("Failed to initialize program");
    }

    // Derive PDA for the CRUD entry
    const [crudEntryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(params.title), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    // Check if entry exists using connection.getAccountInfo
    const existingAccount = await connection.getAccountInfo(crudEntryPDA);
    if (existingAccount === null) {
      return {
        signature: "",
        success: false,
        error: "Entry does not exist",
      };
    }

    const tx = await program.methods
      .updateCrudEntry(params.title, params.message)
      .accounts({
        crudEntry: crudEntryPDA,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${tx}?cluster=${CLUSTER}`;

    return {
      signature: tx,
      success: true,
      explorerUrl,
    };
  } catch (error) {
    console.error("Error updating CRUD entry:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Delete a CRUD entry
 */
export const deleteCrudEntry = async (
  connection: Connection,
  wallet: AnchorWallet,
  params: DeleteCrudEntryParams
): Promise<CrudServiceResult> => {
  try {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });

    let program: Program;
    try {
      program = new Program(crudIdl, PROGRAM_ID, provider);
    } catch (programError) {
      console.error("Error creating program:", programError);
      throw new Error("Failed to initialize program");
    }

    // Derive PDA for the CRUD entry
    const [crudEntryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(params.title), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    // Check if entry exists using connection.getAccountInfo
    const existingAccount = await connection.getAccountInfo(crudEntryPDA);
    if (existingAccount === null) {
      return {
        signature: "",
        success: false,
        error: "Entry does not exist",
      };
    }

    const tx = await program.methods
      .deleteCrudEntry(params.title)
      .accounts({
        crudEntry: crudEntryPDA,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${tx}?cluster=${CLUSTER}`;

    return {
      signature: tx,
      success: true,
      explorerUrl,
    };
  } catch (error) {
    console.error("Error deleting CRUD entry:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Get a specific CRUD entry
 */
export const getCrudEntry = async (
  connection: Connection,
  owner: PublicKey,
  title: string
): Promise<CrudEntryState | null> => {
  try {
    // Derive PDA for the CRUD entry
    const [crudEntryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(title), owner.toBuffer()],
      PROGRAM_ID
    );

    // Use connection directly to get account info
    const accountInfo = await connection.getAccountInfo(crudEntryPDA);
    if (accountInfo === null) {
      return null;
    }

    // For now, we'll return a basic structure since we can't easily parse the account data
    // In a production app, you'd want to implement proper account data deserialization
    return {
      owner: owner,
      title: title,
      message: "Account exists but message parsing not implemented", // Placeholder
    };
  } catch (error) {
    console.error("Error getting CRUD entry:", error);
    return null;
  }
};

/**
 * Get all CRUD entries for a user
 */
export const getUserCrudEntries = async (
  connection: Connection,
  owner: PublicKey
): Promise<CrudEntryState[]> => {
  try {
    // For now, return empty array since we can't easily query all accounts
    // In a production app, you'd want to implement proper account querying
    console.warn(
      "getUserCrudEntries not fully implemented - returning empty array"
    );
    return [];
  } catch (error) {
    console.error("Error getting user CRUD entries:", error);
    return [];
  }
};

/**
 * Validate CRUD entry parameters
 */
export const validateCrudEntry = (
  title: string,
  message: string
): ValidationResult => {
  if (!title.trim()) {
    return { valid: false, error: "Title cannot be empty" };
  }

  if (title.length > 50) {
    return { valid: false, error: "Title must be 50 characters or less" };
  }

  if (!message.trim()) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (message.length > 500) {
    return { valid: false, error: "Message must be 500 characters or less" };
  }

  return { valid: true };
};

/**
 * Validate title for operations
 */
export const validateTitle = (title: string): ValidationResult => {
  if (!title.trim()) {
    return { valid: false, error: "Title cannot be empty" };
  }

  if (title.length > 50) {
    return { valid: false, error: "Title must be 50 characters or less" };
  }

  return { valid: true };
};
