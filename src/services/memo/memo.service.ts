import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  SOLANA_PROGRAMS,
  SOLANA_EXPLORER_BASE_URL,
  CLUSTER,
} from "../solana/constants";
import { MemoServiceResult } from "./memo.types";

/**
 * Send a memo message to the Solana blockchain
 */
export const sendMemoMessage = async (
  connection: Connection,
  wallet: AnchorWallet,
  message: string
): Promise<MemoServiceResult> => {
  try {
    if (!wallet.sendTransaction) {
      throw new Error("Wallet does not support sending transactions");
    }

    if (!message.trim()) {
      throw new Error("Message cannot be empty");
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
      programId: SOLANA_PROGRAMS.MEMO,
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
        explorerUrl: `${SOLANA_EXPLORER_BASE_URL}/tx/${signature}?cluster=${CLUSTER}`,
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
 * Get the memo program ID
 */
export const getMemoProgram = (): PublicKey => {
  return SOLANA_PROGRAMS.MEMO;
};

/**
 * Validate memo message
 */
export const validateMemoMessage = (
  message: string
): { valid: boolean; error?: string } => {
  if (!message.trim()) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (message.length > 566) {
    // Solana transaction size limit consideration
    return { valid: false, error: "Message too long (max 566 characters)" };
  }

  return { valid: true };
};

/**
 * Get memo transaction cost estimate
 */
export const getMemoTransactionCost = async (
  connection: Connection
): Promise<number> => {
  try {
    // Get recent blockhash to estimate transaction cost
    const { feeCalculator } = await connection.getRecentBlockhash();
    return feeCalculator.lamportsPerSignature;
  } catch (error) {
    console.error("Error getting transaction cost:", error);
    return 5000; // Default estimate in lamports
  }
};

/**
 * Check if memo program is available
 */
export const isMemoProgram = async (
  connection: Connection
): Promise<boolean> => {
  try {
    const accountInfo = await connection.getAccountInfo(SOLANA_PROGRAMS.MEMO);
    return accountInfo !== null && accountInfo.executable;
  } catch (error) {
    console.error("Error checking memo program:", error);
    return false;
  }
};

/**
 * Parse memo data from transaction
 */
export const parseMemoFromTransaction = (
  transactionData: any
): string | null => {
  try {
    // This would parse memo data from a transaction
    // Implementation depends on transaction structure
    if (transactionData?.transaction?.message?.instructions) {
      const memoInstruction =
        transactionData.transaction.message.instructions.find(
          (instruction: any) =>
            instruction.programId === SOLANA_PROGRAMS.MEMO.toBase58()
        );

      if (memoInstruction && memoInstruction.data) {
        return Buffer.from(memoInstruction.data, "base64").toString("utf8");
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing memo from transaction:", error);
    return null;
  }
};

/**
 * Get memo program info (renamed to avoid conflict)
 */
export const getMemoProgamInfo = (): {
  programId: PublicKey;
  name: string;
  description: string;
  features: string[];
} => {
  return {
    programId: SOLANA_PROGRAMS.MEMO,
    name: "Memo Program",
    description:
      "Official Solana program for storing arbitrary data in transaction logs",
    features: [
      "Store text messages on-chain",
      "Low cost transactions",
      "Permanent storage in transaction logs",
      "No account creation required",
    ],
  };
};
