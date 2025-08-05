import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
} from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { SOLANA_EXPLORER_BASE_URL, CLUSTER } from "../constants";
import { SystemTransferResult, SystemAccountResult } from "./system.types";

/**
 * Transfer SOL between accounts
 */
export interface WalletWithSendTransaction {
  publicKey: PublicKey;
  sendTransaction: (transaction: Transaction, connection: Connection, options?: any) => Promise<string>;
}

export const transferSol = async (
  connection: Connection,
  wallet: WalletWithSendTransaction,
  recipientAddress: PublicKey,
  amount: number
): Promise<SystemTransferResult> => {
  try {
    if (!wallet.sendTransaction) {
      throw new Error("Wallet does not support sending transactions");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const lamports = Math.floor(amount * 1e9); // Convert SOL to lamports

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
      explorerUrl: `${SOLANA_EXPLORER_BASE_URL}/tx/${signature}?cluster=${CLUSTER}`,
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
 * Create a data account
 */
export const createDataAccount = async (
  connection: Connection,
  wallet: WalletWithSendTransaction,
  dataSize: number = 100
): Promise<SystemAccountResult> => {
  try {
    if (!wallet.sendTransaction) {
      throw new Error("Wallet does not support sending transactions");
    }

    // Generate a new keypair for the data account
    const dataAccount = Keypair.generate();

    // Calculate minimum lamports needed
    const lamports = await connection.getMinimumBalanceForRentExemption(dataSize);

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
      accountAddress: dataAccount.publicKey.toBase58(),
    };
  } catch (error) {
    console.error("Error creating data account:", error);
    return {
      signature: "",
      success: false,
      accountAddress: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Get account balance in SOL
 */
export const getAccountBalance = async (
  connection: Connection,
  publicKey: PublicKey
): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error("Error getting balance:", error);
    return 0;
  }
};

/**
 * Validate SOL amount
 */
export const validateSolAmount = (amount: number): { valid: boolean; error?: string } => {
  if (amount <= 0) {
    return { valid: false, error: "Amount must be greater than 0" };
  }
  
  if (amount > 1000) { // Reasonable limit for devnet
    return { valid: false, error: "Amount too large (max 1000 SOL)" };
  }

  return { valid: true };
};

/**
 * Get minimum rent exemption for account size
 */
export const getMinimumRentExemption = async (
  connection: Connection,
  dataSize: number
): Promise<number> => {
  try {
    const lamports = await connection.getMinimumBalanceForRentExemption(dataSize);
    return lamports / 1e9; // Convert to SOL
  } catch (error) {
    console.error("Error getting minimum rent exemption:", error);
    return 0;
  }
};

/**
 * Check if account has sufficient balance
 */
export const hasSufficientBalance = async (
  connection: Connection,
  publicKey: PublicKey,
  requiredAmount: number
): Promise<boolean> => {
  try {
    const balance = await getAccountBalance(connection, publicKey);
    return balance >= requiredAmount;
  } catch (error) {
    console.error("Error checking balance:", error);
    return false;
  }
};