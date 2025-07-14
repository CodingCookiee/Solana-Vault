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

// Import IDL
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
    const program = new Program(crudIdl, PROGRAM_ID, provider);

    // Derive PDA for the CRUD entry
    const [crudEntryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(params.title), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    // Check if entry already exists
    const existingAccount = await connection.getAccountInfo(crudEntryPDA);
    if (existingAccount !== null) {
      return {
        signature: "",
        success: false,
        error: "Entry with this title already exists",
      };
    }

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
    const program = new Program(crudIdl, PROGRAM_ID, provider);

    // Derive PDA for the CRUD entry
    const [crudEntryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(params.title), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    // Check if entry exists
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
    const program = new Program(crudIdl, PROGRAM_ID, provider);

    // Derive PDA for the CRUD entry
    const [crudEntryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(params.title), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    // Check if entry exists
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
    const provider = new AnchorProvider(connection, {} as AnchorWallet, {
      commitment: "confirmed",
    });
    const program = new Program(crudIdl, PROGRAM_ID, provider);

    // Derive PDA for the CRUD entry
    const [crudEntryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(title), owner.toBuffer()],
      PROGRAM_ID
    );

    const account = await program.account.crudEntryState.fetch(crudEntryPDA);

    return {
      owner: account.owner,
      title: account.title,
      message: account.message,
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
    const provider = new AnchorProvider(connection, {} as AnchorWallet, {
      commitment: "confirmed",
    });
    const program = new Program(crudIdl, PROGRAM_ID, provider);

    const accounts = await program.account.crudEntryState.all([
      {
        memcmp: {
          offset: 8, // Skip discriminator
          bytes: owner.toBase58(),
        },
      },
    ]);

    return accounts.map((account) => ({
      owner: account.account.owner,
      title: account.account.title,
      message: account.account.message,
    }));
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
