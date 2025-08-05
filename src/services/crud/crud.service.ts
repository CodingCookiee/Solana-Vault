import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { web3 } from "@project-serum/anchor";
import { SOLANA_EXPLORER_BASE_URL, CLUSTER } from "../solana/constants";
import {
  CrudServiceResult,
  CreateCrudEntryParams,
  UpdateCrudEntryParams,
  DeleteCrudEntryParams,
  CrudEntryState,
  ValidationResult,
  PROGRAM_ID,
} from "./crud.types";
import { getAnchorProgram, deriveCrudEntryPDA } from "./crud.anchor";

/**
 * Create a new CRUD entry using Anchor
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

    // Get Anchor program instance
    const program = getAnchorProgram(connection, wallet);

    // Derive PDA for the CRUD entry
    const [crudEntryPda] = await deriveCrudEntryPDA(
      params.title,
      wallet.publicKey
    );

    console.log("PDA derived:", crudEntryPda.toString());

    // Check if entry already exists
    try {
      await program.account.crudEntryState.fetch(crudEntryPda);
      return {
        signature: "",
        success: false,
        error: "Entry with this title already exists",
      };
    } catch (err) {
      // Entry doesn't exist, which is what we want for creation
    }

    // Call the createCrudEntry RPC method
    const txn = await program.rpc.createCrudEntry(
      params.title,
      params.message,
      {
        accounts: {
          crudEntry: crudEntryPda,
          owner: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        },
      }
    );

    console.log("Transaction signature:", txn);

    // Fetch the created CRUD entry data
    const crudEntryData = await program.account.crudEntryState.fetch(
      crudEntryPda
    );

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    // Map Anchor decoded struct to CrudEntryState
    const entryData: CrudEntryState = {
      owner: crudEntryData.owner,
      title: crudEntryData.title,
      message: crudEntryData.message,
    };

    return {
      signature: txn,
      success: true,
      explorerUrl,
      data: entryData,
      pda: crudEntryPda.toString(),
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
 * Update an existing CRUD entry using Anchor
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

    // Get Anchor program instance
    const program = getAnchorProgram(connection, wallet);

    // Derive PDA for the CRUD entry
    const [crudEntryPda] = await deriveCrudEntryPDA(
      params.title,
      wallet.publicKey
    );

    // Check if entry exists
    try {
      await program.account.crudEntryState.fetch(crudEntryPda);
    } catch (err) {
      return {
        signature: "",
        success: false,
        error: "Entry does not exist",
      };
    }

    // Call the updateCrudEntry RPC method
    const txn = await program.rpc.updateCrudEntry(
      params.title,
      params.message,
      {
        accounts: {
          crudEntry: crudEntryPda,
          owner: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        },
      }
    );

    console.log("Transaction signature:", txn);

    // Fetch the updated CRUD entry data
    const crudEntryData = await program.account.crudEntryState.fetch(
      crudEntryPda
    );

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    // Map Anchor decoded struct to CrudEntryState
    const entryData: CrudEntryState = {
      owner: crudEntryData.owner,
      title: crudEntryData.title,
      message: crudEntryData.message,
    };

    return {
      signature: txn,
      success: true,
      explorerUrl,
      data: entryData,
      pda: crudEntryPda.toString(),
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
 * Delete a CRUD entry using Anchor
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

    // Get Anchor program instance
    const program = getAnchorProgram(connection, wallet);

    // Derive PDA for the CRUD entry
    const [crudEntryPda] = await deriveCrudEntryPDA(
      params.title,
      wallet.publicKey
    );

    // Check if entry exists
    try {
      await program.account.crudEntryState.fetch(crudEntryPda);
    } catch (err) {
      return {
        signature: "",
        success: false,
        error: "Entry does not exist",
      };
    }

    // Call the deleteCrudEntry RPC method
    const txn = await program.rpc.deleteCrudEntry(params.title, {
      accounts: {
        crudEntry: crudEntryPda,
        owner: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
    });

    console.log("Transaction signature:", txn);

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
      success: true,
      explorerUrl,
      pda: crudEntryPda.toString(),
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
 * Get a specific CRUD entry using Anchor
 */
export const getCrudEntry = async (
  connection: Connection,
  owner: PublicKey,
  title: string
): Promise<CrudEntryState | null> => {
  try {
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

    // Get Anchor program instance
    const program = getAnchorProgram(connection, dummyWallet);

    // Derive PDA for the CRUD entry
    const [crudEntryPda] = await deriveCrudEntryPDA(title, owner);

    // Fetch the CRUD entry data
    const crudEntryData = await program.account.crudEntryState.fetch(
      crudEntryPda
    );

    // Map Anchor decoded struct to CrudEntryState
    const entryData: CrudEntryState = {
      owner: crudEntryData.owner,
      title: crudEntryData.title,
      message: crudEntryData.message,
    };

    return entryData;
  } catch (error) {
    console.error("Error getting CRUD entry:", error);
    return null;
  }
};

/**
 * Get all CRUD entries for a user using Anchor
 */
export const getUserCrudEntries = async (
  connection: Connection,
  owner: PublicKey
): Promise<CrudEntryState[]> => {
  try {
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

    // Get Anchor program instance
    const program = getAnchorProgram(connection, dummyWallet);

    // Get all program accounts for this program filtered by owner
    const programAccounts = await program.account.crudEntryState.all([
      {
        memcmp: {
          offset: 8, // Skip discriminator
          bytes: owner.toBase58(),
        },
      },
    ]);

    console.log(`Found ${programAccounts.length} accounts for owner`);

    // Extract account data
    const entries: CrudEntryState[] = programAccounts.map((account) => ({
      owner: account.account.owner,
      title: account.account.title,
      message: account.account.message,
    }));

    return entries;
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