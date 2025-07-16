import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { SOLANA_EXPLORER_BASE_URL, CLUSTER } from "../solana/constants";
import {
  CrudServiceResult,
  CreateCrudEntryParams,
  UpdateCrudEntryParams,
  DeleteCrudEntryParams,
  CrudEntryState,
  UserCrudEntries,
  ValidationResult,
  PROGRAM_ID,
} from "./crud.types";
import { 
  getAnchorProgram, 
  deriveUserEntriesPDA,
  isUserEntriesInitialized,
  getUserEntriesAccount,
  getReadOnlyProgram
} from "./crud.anchor";

/**
 * Initialize user entries account
 */
export const initializeUserEntries = async (
  connection: Connection,
  wallet: AnchorWallet
): Promise<CrudServiceResult> => {
  try {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    // Check if already initialized
    const isInitialized = await isUserEntriesInitialized(connection, wallet.publicKey);
    if (isInitialized) {
      return {
        signature: "",
        success: false,
        error: "User entries account already initialized",
      };
    }

    // Get Anchor program instance
    const program = getAnchorProgram(connection, wallet);

    // Derive PDA for user entries
    const [userEntriesPDA] = await deriveUserEntriesPDA(wallet.publicKey);

    console.log("User entries PDA:", userEntriesPDA.toString());

    // Call the initialize_user_entries instruction
    const txn = await program.methods
      .initializeUserEntries()
      .accounts({
        userEntries: userEntriesPDA,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Initialize transaction signature:", txn);

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
      success: true,
      explorerUrl,
    };
  } catch (error) {
    console.error("Error initializing user entries:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

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

    // Validate input parameters
    const validation = validateCrudEntry(params.title, params.message);
    if (!validation.valid) {
      return {
        signature: "",
        success: false,
        error: validation.error,
      };
    }

    // Check if user entries account is initialized
    const isInitialized = await isUserEntriesInitialized(connection, wallet.publicKey);
    if (!isInitialized) {
      return {
        signature: "",
        success: false,
        error: "User entries account not initialized. Please initialize first.",
      };
    }

    // Get Anchor program instance
    const program = getAnchorProgram(connection, wallet);

    // Derive PDA for user entries
    const [userEntriesPDA] = await deriveUserEntriesPDA(wallet.publicKey);

    console.log("User entries PDA:", userEntriesPDA.toString());

    // Check if entry with this title already exists
    const existingEntries = await getUserEntriesAccount(connection, wallet, wallet.publicKey);
    if (existingEntries && existingEntries.entries.some((entry: any) => entry.title === params.title)) {
      return {
        signature: "",
        success: false,
        error: "Entry with this title already exists",
      };
    }

    // Call the create_crud_entry instruction
    const txn = await program.methods
      .createCrudEntry(params.title, params.message)
      .accounts({
        userEntries: userEntriesPDA,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Create transaction signature:", txn);

    // Fetch the updated user entries data
    const userEntriesData = await getUserEntriesAccount(connection, wallet, wallet.publicKey);

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
      success: true,
      explorerUrl,
      data: userEntriesData,
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

    // Validate input parameters
    const validation = validateCrudEntry(params.title, params.message);
    if (!validation.valid) {
      return {
        signature: "",
        success: false,
        error: validation.error,
      };
    }

    // Check if user entries account is initialized
    const isInitialized = await isUserEntriesInitialized(connection, wallet.publicKey);
    if (!isInitialized) {
      return {
        signature: "",
        success: false,
        error: "User entries account not initialized. Please initialize first.",
      };
    }

    // Get Anchor program instance
    const program = getAnchorProgram(connection, wallet);

    // Derive PDA for user entries
    const [userEntriesPDA] = await deriveUserEntriesPDA(wallet.publicKey);

    // Check if entry exists
    const existingEntries = await getUserEntriesAccount(connection, wallet, wallet.publicKey);
    if (!existingEntries || !existingEntries.entries.some((entry: any) => entry.title === params.title)) {
      return {
        signature: "",
        success: false,
        error: "Entry does not exist",
      };
    }

    // Call the update_crud_entry instruction
    const txn = await program.methods
      .updateCrudEntry(params.title, params.message)
      .accounts({
        userEntries: userEntriesPDA,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Update transaction signature:", txn);

    // Fetch the updated user entries data
    const userEntriesData = await getUserEntriesAccount(connection, wallet, wallet.publicKey);

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
      success: true,
      explorerUrl,
      data: userEntriesData,
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

    // Validate input parameters
    const validation = validateTitle(params.title);
    if (!validation.valid) {
      return {
        signature: "",
        success: false,
        error: validation.error,
      };
    }

    // Check if user entries account is initialized
    const isInitialized = await isUserEntriesInitialized(connection, wallet.publicKey);
    if (!isInitialized) {
      return {
        signature: "",
        success: false,
        error: "User entries account not initialized. Please initialize first.",
      };
    }

    // Get Anchor program instance
    const program = getAnchorProgram(connection, wallet);

    // Derive PDA for user entries
    const [userEntriesPDA] = await deriveUserEntriesPDA(wallet.publicKey);

    // Check if entry exists
    const existingEntries = await getUserEntriesAccount(connection, wallet, wallet.publicKey);
    if (!existingEntries || !existingEntries.entries.some((entry: any) => entry.title === params.title)) {
      return {
        signature: "",
        success: false,
        error: "Entry does not exist",
      };
    }

    // Call the delete_crud_entry instruction
    const txn = await program.methods
      .deleteCrudEntry(params.title)
      .accounts({
        userEntries: userEntriesPDA,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Delete transaction signature:", txn);

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
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
    // Check if user entries account is initialized
    const isInitialized = await isUserEntriesInitialized(connection, owner);
    if (!isInitialized) {
      return null;
    }

    // Create a dummy wallet for read operations
    const dummyWallet = {
      publicKey: owner,
      signTransaction: async () => {
        throw new Error("Read-only operation");
      },
      signAllTransactions: async () => {
        throw new Error("Read-only operation");
      },
    } as AnchorWallet;

    // Get user entries data
    const userEntriesData = await getUserEntriesAccount(connection, dummyWallet, owner);
    
    if (!userEntriesData) {
      return null;
    }

    // Find the specific entry
    const entry = userEntriesData.entries.find((e: any) => e.title === title);
    
    if (!entry) {
      return null;
    }

    return {
      owner,
      title: entry.title,
      message: entry.message,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
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
    // Check if user entries account is initialized
    const isInitialized = await isUserEntriesInitialized(connection, owner);
    if (!isInitialized) {
      return [];
    }

    // Create a dummy wallet for read operations
    const dummyWallet = {
      publicKey: owner,
      signTransaction: async () => {
        throw new Error("Read-only operation");
      },
      signAllTransactions: async () => {
        throw new Error("Read-only operation");
      },
    } as AnchorWallet;

    // Get user entries data
    const userEntriesData = await getUserEntriesAccount(connection, dummyWallet, owner);
    
    if (!userEntriesData) {
      return [];
    }

    // Convert entries to CrudEntryState format
    const entries: CrudEntryState[] = userEntriesData.entries.map((entry: any) => ({
      owner,
      title: entry.title,
      message: entry.message,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
    }));

    console.log(`Found ${entries.length} entries for owner`);

    return entries;
  } catch (error) {
    console.error("Error getting user CRUD entries:", error);
    return [];
  }
};

/**
 * Get user entries account data directly
 */
export const getUserEntriesAccountData = async (
  connection: Connection,
  owner: PublicKey
): Promise<UserCrudEntries | null> => {
  try {
    // Check if user entries account is initialized
    const isInitialized = await isUserEntriesInitialized(connection, owner);
    if (!isInitialized) {
      return null;
    }

    // Create a dummy wallet for read operations
    const dummyWallet = {
      publicKey: owner,
      signTransaction: async () => {
        throw new Error("Read-only operation");
      },
      signAllTransactions: async () => {
        throw new Error("Read-only operation");
      },
    } as AnchorWallet;

    return await getUserEntriesAccount(connection, dummyWallet, owner);
  } catch (error) {
    console.error("Error getting user entries account data:", error);
    return null;
  }
};

/**
 * Validate CRUD entry parameters
 */
export const validateCrudEntry = (
  title: string,
  message: string
): ValidationResult => {
  if (!title || !title.trim()) {
    return { valid: false, error: "Title cannot be empty" };
  }

  if (title.length > 50) {
    return { valid: false, error: "Title must be 50 characters or less" };
  }

  if (!message || !message.trim()) {
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
  if (!title || !title.trim()) {
    return { valid: false, error: "Title cannot be empty" };
  }

  if (title.length > 50) {
    return { valid: false, error: "Title must be 50 characters or less" };
  }

  return { valid: true };
};

/**
 * Helper function to check if program is deployed
 */
export const isProgramDeployed = async (
  connection: Connection
): Promise<boolean> => {
  try {
    const programAccount = await connection.getAccountInfo(PROGRAM_ID);
    return programAccount !== null && programAccount.executable;
  } catch (error) {
    console.error("Error checking program deployment:", error);
    return false;
  }
};

/**
 * Helper function to get program info
 */
export const getProgramInfo = async (connection: Connection) => {
  try {
    const programAccount = await connection.getAccountInfo(PROGRAM_ID);
    return {
      exists: programAccount !== null,
      executable: programAccount?.executable || false,
      owner: programAccount?.owner.toString(),
      lamports: programAccount?.lamports || 0,
    };
  } catch (error) {
    console.error("Error getting program info:", error);
    return null;
  }
};
