import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  sendMemoMessage,
  validateMemoMessage,
  getMemoTransactionCost,
} from "./memo.service";
import { MemoServiceResult } from "./memo.types";

/**
 * Hook for memo program interactions
 */
export const useMemoService = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMemo = useCallback(
    async (message: string): Promise<MemoServiceResult> => {
      if (!wallet.connected || !wallet.publicKey) {
        const result: MemoServiceResult = {
          signature: "",
          success: false,
          error: "Wallet not connected",
        };
        setError("Wallet not connected");
        return result;
      }

      // Validate message first
      const validation = validateMemoMessage(message);
      if (!validation.valid) {
        const result: MemoServiceResult = {
          signature: "",
          success: false,
          error: validation.error,
        };
        setError(validation.error || "Invalid message");
        return result;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await sendMemoMessage(
          connection,
          wallet as any,
          message
        );

        if (!result.success) {
          setError(result.error || "Failed to send memo");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return {
          signature: "",
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet]
  );

  const getTransactionCost = useCallback(async (): Promise<number> => {
    try {
      return await getMemoTransactionCost(connection);
    } catch (err) {
      console.error("Error getting transaction cost:", err);
      return 5000; // Default estimate
    }
  }, [connection]);

  const validateMessage = useCallback((message: string) => {
    return validateMemoMessage(message);
  }, []);

  return {
    sendMemo,
    getTransactionCost,
    validateMessage,
    loading,
    error,
    clearError: () => setError(null),
  };
};
