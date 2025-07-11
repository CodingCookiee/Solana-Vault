import { useState, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  readAccountData,
  checkAccountExists,
  getAccountTransactions,
  isValidPublicKey,
} from "./account.service";
import { AccountInfo, TransactionInfo } from "@/services/index";
import { AccountExistsResult } from "./account.types";

/**
 * Hook for account-related operations
 */
export const useAccountService = () => {
  const { connection } = useConnection();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readAccount = useCallback(async (address: string): Promise<AccountInfo | null> => {
    if (!isValidPublicKey(address)) {
      setError("Invalid public key format");
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const accountPubkey = new PublicKey(address);
      const accountData = await readAccountData(connection, accountPubkey);
      
      return accountData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [connection]);

  const checkExists = useCallback(async (address: string): Promise<AccountExistsResult> => {
    if (!isValidPublicKey(address)) {
      return { exists: false };
    }

    try {
      setLoading(true);
      setError(null);
      
      const accountPubkey = new PublicKey(address);
      const result = await checkAccountExists(connection, accountPubkey);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { exists: false };
    } finally {
      setLoading(false);
    }
  }, [connection]);

  const getTransactions = useCallback(async (
    address: string, 
    limit: number = 10
  ): Promise<TransactionInfo[]> => {
    if (!isValidPublicKey(address)) {
      setError("Invalid public key format");
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      const accountPubkey = new PublicKey(address);
      const transactions = await getAccountTransactions(connection, accountPubkey, limit);
      
      return transactions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [connection]);

  const validateAddress = useCallback((address: string) => {
    return isValidPublicKey(address);
  }, []);

  return {
    readAccount,
    checkExists,
    getTransactions,
    validateAddress,
    loading,
    error,
    clearError: () => setError(null),
  };
};
