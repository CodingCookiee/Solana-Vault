import { useState, useCallback, useEffect } from "react";
import {
  useConnection,
  useWallet,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  createCrudEntry,
  updateCrudEntry,
  deleteCrudEntry,
  getCrudEntry,
  getUserCrudEntries,
  validateCrudEntry,
  validateTitle,
} from "./crud.service";
import {
  CrudServiceResult,
  CreateCrudEntryParams,
  UpdateCrudEntryParams,
  DeleteCrudEntryParams,
  CrudEntryState,
  CrudHookState,
} from "./crud.types";

/**
 * Hook for CRUD operations
 */
export const useCrudService = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();

  const [state, setState] = useState<CrudHookState>({
    entries: [],
    loading: false,
    error: null,
  });

  // Create CRUD entry
  const createEntry = useCallback(
    async (params: CreateCrudEntryParams): Promise<CrudServiceResult> => {
      if (!wallet.connected || !wallet.publicKey || !anchorWallet) {
        const result: CrudServiceResult = {
          signature: "",
          success: false,
          error: "Wallet not connected",
        };
        setState((prev) => ({ ...prev, error: "Wallet not connected" }));
        return result;
      }

      const validation = validateCrudEntry(params.title, params.message);
      if (!validation.valid) {
        const result: CrudServiceResult = {
          signature: "",
          success: false,
          error: validation.error,
        };
        setState((prev) => ({
          ...prev,
          error: validation.error || "Validation failed",
        }));
        return result;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const result = await createCrudEntry(connection, anchorWallet, params);

        if (result.success) {
          // Refresh entries after successful creation
          await refreshEntries();
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error || "Failed to create entry",
          }));
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setState((prev) => ({ ...prev, error: errorMessage }));
        return {
          signature: "",
          success: false,
          error: errorMessage,
        };
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [connection, wallet, anchorWallet]
  );

  // Update CRUD entry
  const updateEntry = useCallback(
    async (params: UpdateCrudEntryParams): Promise<CrudServiceResult> => {
      if (!wallet.connected || !wallet.publicKey || !anchorWallet) {
        const result: CrudServiceResult = {
          signature: "",
          success: false,
          error: "Wallet not connected",
        };
        setState((prev) => ({ ...prev, error: "Wallet not connected" }));
        return result;
      }

      const validation = validateCrudEntry(params.title, params.message);
      if (!validation.valid) {
        const result: CrudServiceResult = {
          signature: "",
          success: false,
          error: validation.error,
        };
        setState((prev) => ({
          ...prev,
          error: validation.error || "Validation failed",
        }));
        return result;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const result = await updateCrudEntry(connection, anchorWallet, params);

        if (result.success) {
          // Refresh entries after successful update
          await refreshEntries();
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error || "Failed to update entry",
          }));
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setState((prev) => ({ ...prev, error: errorMessage }));
        return {
          signature: "",
          success: false,
          error: errorMessage,
        };
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [connection, wallet, anchorWallet]
  );

  // Delete CRUD entry
  const deleteEntry = useCallback(
    async (params: DeleteCrudEntryParams): Promise<CrudServiceResult> => {
      if (!wallet.connected || !wallet.publicKey || !anchorWallet) {
        const result: CrudServiceResult = {
          signature: "",
          success: false,
          error: "Wallet not connected",
        };
        setState((prev) => ({ ...prev, error: "Wallet not connected" }));
        return result;
      }

      const validation = validateTitle(params.title);
      if (!validation.valid) {
        const result: CrudServiceResult = {
          signature: "",
          success: false,
          error: validation.error,
        };
        setState((prev) => ({
          ...prev,
          error: validation.error || "Validation failed",
        }));
        return result;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const result = await deleteCrudEntry(connection, anchorWallet, params);

        if (result.success) {
          // Refresh entries after successful deletion
          await refreshEntries();
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error || "Failed to delete entry",
          }));
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setState((prev) => ({ ...prev, error: errorMessage }));
        return {
          signature: "",
          success: false,
          error: errorMessage,
        };
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [connection, wallet, anchorWallet]
  );

  // Get specific entry
  const getEntry = useCallback(
    async (title: string): Promise<CrudEntryState | null> => {
      if (!wallet.publicKey) return null;

      try {
        return await getCrudEntry(connection, wallet.publicKey, title);
      } catch (err) {
        console.error("Error getting entry:", err);
        return null;
      }
    },
    [connection, wallet.publicKey]
  );

  // Refresh entries
  const refreshEntries = useCallback(async () => {
    if (!wallet.publicKey) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const entries = await getUserCrudEntries(connection, wallet.publicKey);
      setState((prev) => ({ ...prev, entries, loading: false }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
    }
  }, [connection, wallet.publicKey]);

  // Auto-refresh on wallet connection
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      refreshEntries();
    } else {
      setState({ entries: [], loading: false, error: null });
    }
  }, [wallet.connected, wallet.publicKey, refreshEntries]);

  return {
    // Operations
    createEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    refreshEntries,

    // State
    entries: state.entries,
    loading: state.loading,
    error: state.error,

    // Utility
    clearError: () => setState((prev) => ({ ...prev, error: null })),
    isWalletConnected: wallet.connected,
    userPublicKey: wallet.publicKey,
  };
};

/**
 * Hook for getting entries of a specific user
 */
export const useUserCrudEntries = (userPublicKey?: PublicKey) => {
  const { connection } = useConnection();
  const [entries, setEntries] = useState<CrudEntryState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshEntries = useCallback(async () => {
    if (!userPublicKey) return;

    try {
      setLoading(true);
      setError(null);
      const userEntries = await getUserCrudEntries(connection, userPublicKey);
      setEntries(userEntries);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [connection, userPublicKey]);

  useEffect(() => {
    if (userPublicKey) {
      refreshEntries();
    }
  }, [userPublicKey, refreshEntries]);

  return {
    entries,
    loading,
    error,
    refreshEntries,
  };
};
