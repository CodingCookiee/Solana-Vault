import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Keypair,
  AccountMeta,
  TransactionSignature,
} from "@solana/web3.js";
import { Program, AnchorProvider, web3, BN, Idl } from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";

export interface RealProgramResult {
  signature: string;
  success: boolean;
  error?: string;
  data?: any;
}

// Real deployed programs on devnet
export const REAL_PROGRAMS = {
  // Memo program - always available
  MEMO: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),

  // System Program
  SYSTEM: SystemProgram.programId,

  // A real simple counter program deployed on devnet (example)
  // This would be replaced with an actual deployed program
  GUESTBOOK: new PublicKey("F7TehQFrx3XkuMsLPcmKLz44UxTWWfyodNLSungdqoRX"),
};

// Simple Guestbook IDL (example of a real deployed program)
export const GUESTBOOK_IDL: Idl = {
  version: "0.1.0",
  name: "guestbook",
  instructions: [
    {
      name: "addEntry",
      accounts: [
        {
          name: "entry",
          isMut: true,
          isSigner: true,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "message",
          type: "string",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "GuestbookEntry",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "publicKey",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "message",
            type: "string",
          },
          {
            name: "timestamp",
            type: "i64",
          },
        ],
      },
    },
  ],
};

/**
 * Send a memo using the Memo program (guaranteed to work)
 */
export const sendMemoMessage = async (
  connection: Connection,
  wallet: AnchorWallet,
  message: string
): Promise<RealProgramResult> => {
  try {
    if (!wallet.sendTransaction) {
      throw new Error("Wallet does not support sending transactions");
    }

    const transaction = new Transaction();

    // Create memo instruction
    const memoInstruction = new TransactionInstruction({
      keys: [
        {
          pubkey: wallet.publicKey,
          isSigner: true,
          isWritable: false,
        },
      ],
      programId: REAL_PROGRAMS.MEMO,
      data: Buffer.from(message, "utf8"),
    });

    transaction.add(memoInstruction);

    // Send transaction
    const signature = await wallet.sendTransaction(transaction, connection);

    // Wait for confirmation
    await connection.confirmTransaction(signature, "processed");

    return {
      signature,
      success: true,
      data: {
        message,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      },
    };
  } catch (error) {
    console.error("Error sending memo:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Create a simple account with some data (using System Program)
 */
export const createDataAccount = async (
  connection: Connection,
  wallet: AnchorWallet,
  dataSize: number = 100
): Promise<RealProgramResult> => {
  try {
    if (!wallet.sendTransaction) {
      throw new Error("Wallet does not support sending transactions");
    }

    // Generate a new keypair for the data account
    const dataAccount = Keypair.generate();

    // Calculate minimum lamports needed
    const lamports = await connection.getMinimumBalanceForRentExemption(
      dataSize
    );

    // Create the account
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: dataAccount.publicKey,
        lamports,
        space: dataSize,
        programId: wallet.publicKey, // Owner will be the user
      })
    );

    // Send transaction
    const signature = await wallet.sendTransaction(transaction, connection, {
      signers: [dataAccount],
    });

    // Wait for confirmation
    await connection.confirmTransaction(signature, "processed");

    return {
      signature,
      success: true,
      data: {
        accountAddress: dataAccount.publicKey.toBase58(),
        lamports,
        dataSize,
        explorerUrl: `https://explorer.solana.com/address/${dataAccount.publicKey.toBase58()}?cluster=devnet`,
      },
    };
  } catch (error) {
    console.error("Error creating data account:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Read account data from any Solana account
 */
export const readAccountData = async (
  connection: Connection,
  accountAddress: PublicKey
): Promise<any> => {
  try {
    const accountInfo = await connection.getAccountInfo(accountAddress);

    if (!accountInfo) {
      throw new Error("Account not found");
    }

    return {
      owner: accountInfo.owner.toBase58(),
      lamports: accountInfo.lamports,
      dataLength: accountInfo.data.length,
      executable: accountInfo.executable,
      rentEpoch: accountInfo.rentEpoch,
      data: accountInfo.data.toString("hex"), // Raw data as hex string
      explorerUrl: `https://explorer.solana.com/address/${accountAddress.toBase58()}?cluster=devnet`,
    };
  } catch (error) {
    console.error("Error reading account data:", error);
    throw error;
  }
};

/**
 * Read program accounts owned by a specific program
 */
export const getProgramAccountsData = async (
  connection: Connection,
  programId: PublicKey
): Promise<any[]> => {
  try {
    const accounts = await connection.getProgramAccounts(programId, {
      commitment: "processed",
    });

    return accounts.map((account) => ({
      pubkey: account.pubkey.toBase58(),
      owner: account.account.owner.toBase58(),
      lamports: account.account.lamports,
      dataLength: account.account.data.length,
      executable: account.account.executable,
      explorerUrl: `https://explorer.solana.com/address/${account.pubkey.toBase58()}?cluster=devnet`,
    }));
  } catch (error) {
    console.error("Error getting program accounts:", error);
    throw error;
  }
};

/**
 * Check if an account exists and get its info
 */
export const checkAccountExists = async (
  connection: Connection,
  accountAddress: PublicKey
): Promise<{ exists: boolean; info?: any }> => {
  try {
    const accountInfo = await connection.getAccountInfo(accountAddress);

    if (!accountInfo) {
      return { exists: false };
    }

    return {
      exists: true,
      info: {
        owner: accountInfo.owner.toBase58(),
        lamports: accountInfo.lamports,
        dataLength: accountInfo.data.length,
        executable: accountInfo.executable,
        rentEpoch: accountInfo.rentEpoch,
        explorerUrl: `https://explorer.solana.com/address/${accountAddress.toBase58()}?cluster=devnet`,
      },
    };
  } catch (error) {
    console.error("Error checking account:", error);
    return { exists: false };
  }
};

/**
 * Get recent transactions for an address
 */
export const getAccountTransactions = async (
  connection: Connection,
  accountAddress: PublicKey,
  limit: number = 10
): Promise<any[]> => {
  try {
    const signatures = await connection.getSignaturesForAddress(
      accountAddress,
      { limit },
      "processed"
    );

    return signatures.map((sig) => ({
      signature: sig.signature,
      slot: sig.slot,
      blockTime: sig.blockTime,
      confirmationStatus: sig.confirmationStatus,
      err: sig.err,
      explorerUrl: `https://explorer.solana.com/tx/${sig.signature}?cluster=devnet`,
    }));
  } catch (error) {
    console.error("Error getting transactions:", error);
    throw error;
  }
};

/**
 * Transfer SOL between accounts
 */
export const transferSol = async (
  connection: Connection,
  wallet: AnchorWallet,
  recipientAddress: PublicKey,
  amount: number
): Promise<RealProgramResult> => {
  try {
    if (!wallet.sendTransaction) {
      throw new Error("Wallet does not support sending transactions");
    }

    const lamports = amount * 1e9; // Convert SOL to lamports

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipientAddress,
        lamports,
      })
    );

    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, "processed");

    return {
      signature,
      success: true,
      data: {
        amount,
        recipient: recipientAddress.toBase58(),
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      },
    };
  } catch (error) {
    console.error("Error transferring SOL:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Hook for real program interactions
 */
export const useRealProgramInteractions = () => {
  return {
    sendMemoMessage,
    createDataAccount,
    getProgramAccountsData,
    checkAccountExists,
    getAccountTransactions,
    transferSol,
    readAccountData, // Add this to the hook
    REAL_PROGRAMS,
  };
};
