import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  transferSol,
  createDataAccount,
  getAccountBalance,
  validateSolAmount,
  hasSufficientBalance,
} from "./system.service";
import { SystemTransferResult, SystemAccountResult } from "./system.types";
import { PublicKey } from "@solana/web3.js";

/**
 * Hook for system program interactions
 */
export const useSystemService = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transfer = useCallback(
    async (
      recipientAddress: string,
      amount: number
    ): Promise<SystemTransferResult> => {
      if (!wallet.connected || !wallet.publicKey) {
        const result: SystemTransferResult = {
          signature: "",
          success: false,
          error: "Wallet not connected",
        };
        setError("Wallet not connected");
        return result;
      }

      const validation = validateSolAmount(amount);
      if (!validation.valid) {
        const result: SystemTransferResult = {
          signature: "",
          success: false,
          error: validation.error,
        };
        setError(validation.error || "Invalid amount");
        return result;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await transferSol(
          connection,
          wallet as any,
          new PublicKey(recipientAddress),
          amount
        );

        if (!result.success) {
          setError(result.error || "Failed to transfer SOL");
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

  const createAccount = useCallback(
    async (space: number): Promise<SystemAccountResult> => {
      if (!wallet.connected || !wallet.publicKey) {
        const result: SystemAccountResult = {
          signature: "",
          accountAddress: "",
          success: false,
          error: "Wallet not connected",
        };
        setError("Wallet not connected");
        return result;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await createDataAccount(connection, wallet as any, space);

        if (!result.success) {
          setError(result.error || "Failed to create account");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return {
          signature: "",
          accountAddress: "",
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet]
  );

  const getBalance = useCallback(
    async (address?: string): Promise<number> => {
      try {
        const targetAddress = address || wallet.publicKey?.toString();
        if (!targetAddress) {
          throw new Error("No address provided and wallet not connected");
        }

        return await getAccountBalance(connection, new PublicKey(targetAddress));
      } catch (err) {
        console.error("Error getting balance:", err);
        return 0;
      }
    },
    [connection, wallet.publicKey]
  );

  const checkSufficientBalance = useCallback(
    async (amount: number, address?: string): Promise<boolean> => {
      try {
        const targetAddress = address || wallet.publicKey?.toString();
        if (!targetAddress) return false;

        return await hasSufficientBalance(connection, new PublicKey(targetAddress), amount);
      } catch (err) {
        console.error("Error checking balance:", err);
        return false;
      }
    },
    [connection, wallet.publicKey]
  );

  const validateAmount = useCallback((amount: number) => {
    return validateSolAmount(amount);
  }, []);

  return {
    transfer,
    createAccount,
    getBalance,
    checkSufficientBalance,
    validateAmount,
    loading,
    error,
    clearError: () => setError(null),
  };
};