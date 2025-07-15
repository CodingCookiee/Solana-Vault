import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
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

// Import the discriminators from your IDL
const CREATE_CRUD_ENTRY_DISCRIMINATOR = [52, 79, 186, 16, 139, 8, 79, 194];
const UPDATE_CRUD_ENTRY_DISCRIMINATOR = [42, 189, 91, 195, 130, 223, 6, 240];
const DELETE_CRUD_ENTRY_DISCRIMINATOR = [170, 8, 190, 38, 255, 222, 33, 201];

/**
 * Serialize a string for Solana instruction data
 */
function serializeString(str: string): Buffer {
  const strBytes = Buffer.from(str, "utf8");
  const lengthBytes = Buffer.alloc(4);
  lengthBytes.writeUInt32LE(strBytes.length, 0);
  return Buffer.concat([lengthBytes, strBytes]);
}

/**
 * Create instruction data for CRUD operations
 */
function createInstructionData(
  discriminator: number[],
  title: string,
  message?: string
): Buffer {
  const discriminatorBuffer = Buffer.from(discriminator);
  const titleBuffer = serializeString(title);

  if (message !== undefined) {
    const messageBuffer = serializeString(message);
    return Buffer.concat([discriminatorBuffer, titleBuffer, messageBuffer]);
  }

  return Buffer.concat([discriminatorBuffer, titleBuffer]);
}

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

    // Derive PDA for the CRUD entry
    const [crudEntryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(params.title), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    console.log("PDA derived:", crudEntryPDA.toString());

    // Check if entry already exists
    const existingAccount = await connection.getAccountInfo(crudEntryPDA);
    if (existingAccount !== null) {
      return {
        signature: "",
        success: false,
        error: "Entry with this title already exists",
      };
    }

    // Create instruction data
    const instructionData = createInstructionData(
      CREATE_CRUD_ENTRY_DISCRIMINATOR,
      params.title,
      params.message
    );

    // Create the instruction
    const instruction = new TransactionInstruction({
      keys: [
        {
          pubkey: crudEntryPDA,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: wallet.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    });

    // Create transaction
    const transaction = new Transaction().add(instruction);

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    // Wait for confirmation
    await connection.confirmTransaction(signature, "confirmed");

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${signature}?cluster=${CLUSTER}`;

    return {
      signature,
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

    // Validate input parameters
    const validation = validateCrudEntry(params.title, params.message);
    if (!validation.valid) {
      return {
        signature: "",
        success: false,
        error: validation.error,
      };
    }

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

    // Create instruction data
    const instructionData = createInstructionData(
      UPDATE_CRUD_ENTRY_DISCRIMINATOR,
      params.title,
      params.message
    );

    // Create the instruction
    const instruction = new TransactionInstruction({
      keys: [
        {
          pubkey: crudEntryPDA,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: wallet.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    });

    // Create transaction
    const transaction = new Transaction().add(instruction);

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    // Wait for confirmation
    await connection.confirmTransaction(signature, "confirmed");

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${signature}?cluster=${CLUSTER}`;

    return {
      signature,
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

    // Validate input parameters
    const validation = validateTitle(params.title);
    if (!validation.valid) {
      return {
        signature: "",
        success: false,
        error: validation.error,
      };
    }

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

    // Create instruction data
    const instructionData = createInstructionData(
      DELETE_CRUD_ENTRY_DISCRIMINATOR,
      params.title
    );

    // Create the instruction
    const instruction = new TransactionInstruction({
      keys: [
        {
          pubkey: crudEntryPDA,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: wallet.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    });

    // Create transaction
    const transaction = new Transaction().add(instruction);

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    // Wait for confirmation
    await connection.confirmTransaction(signature, "confirmed");

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${signature}?cluster=${CLUSTER}`;

    return {
      signature,
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
 * Deserialize account data to CrudEntryState
 */
function deserializeCrudEntry(
  data: Buffer,
  expectedOwner: PublicKey
): CrudEntryState | null {
  try {
    // Skip discriminator (8 bytes)
    let offset = 8;

    // Read owner (32 bytes)
    const owner = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;

    // Read title string (4 bytes length + string data)
    const titleLength = data.readUInt32LE(offset);
    offset += 4;
    const title = data.slice(offset, offset + titleLength).toString("utf8");
    offset += titleLength;

    // Read message string (4 bytes length + string data)
    const messageLength = data.readUInt32LE(offset);
    offset += 4;
    const message = data.slice(offset, offset + messageLength).toString("utf8");

    return {
      owner,
      title,
      message,
    };
  } catch (error) {
    console.error("Error deserializing CRUD entry:", error);
    return null;
  }
}

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

    // Get account info
    const accountInfo = await connection.getAccountInfo(crudEntryPDA);
    if (accountInfo === null) {
      return null;
    }

    // Deserialize the account data
    return deserializeCrudEntry(accountInfo.data, owner);
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
    // Get all program accounts for this program
    const programAccounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: owner.toBase58(),
          },
        },
      ],
    });

    console.log(`Found ${programAccounts.length} accounts for owner`);

    // Deserialize all accounts
    const entries: CrudEntryState[] = [];
    for (const account of programAccounts) {
      const entry = deserializeCrudEntry(account.account.data, owner);
      if (entry) {
        entries.push(entry);
      }
    }

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
