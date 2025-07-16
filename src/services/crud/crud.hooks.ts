import { useState, useCallback, useEffect } from "react";
import {
  useConnection,
  useWallet,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  initializeUserEntries,
  createCrudEntry,
  updateCrudEntry,
  deleteCrudEntry,
  getCrudEntry,
  getUserCrudEntries,
  getUserEntriesAccountData,
  validateCrudEntry,
  validateTitle,
} from "./crud.service";
import {
  isUserEntriesInitialized,
} from "./crud.anchor";
import {
  CrudServiceResult,
  CreateCrudEntryParams,
  UpdateCrudEntryParams,
  DeleteCrudEntryParams,
  CrudEntryState,
  CrudHookState,
  UserCrudEntries,
} from "./crud.types";

/**
 * Hook for CRUD operations with single PDA architecture
 */
export const useCrudService = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();

  const [state, setState] = useState<CrudHookState>({
    entries: [],
    loading: false,
    error: null,
    isInitialized: false,
  });

  // Initialize user entries account
  const initializeUser = useCallback(async (): Promise<CrudServiceResult> => {
    if (!wallet.connected || !wallet.publicKey || !anchorWallet) {
      const result: CrudServiceResult = {
        signature: "",
        success: false,
        error: "Wallet not connected",
      };
      setState((prev) => ({ ...prev, error: "Wallet not connected" }));
      return result;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const result = await initializeUserEntries(connection, anchorWallet);

      if (result.success) {
        setState((prev) => ({ ...prev, isInitialized: true }));
        // Refresh entries after successful initialization
        await refreshEntries();
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || "Failed to initialize user entries",
        }));
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setState((prev) => ({ ...prev, error: errorMessage }));
      return {
        signature: "",
        success: false,
        error: errorMessage,
      };
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [connection, wallet, anchorWallet]);

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
      
      // Check if user entries account is initialized
      const initialized = await isUserEntriesInitialized(connection, wallet.publicKey);
      
      if (!initialized) {
        setState((prev) => ({ 
          ...prev, 
          entries: [], 
          loading: false, 
          isInitialized: false 
        }));
        return;
      }

      const entries = await getUserCrudEntries(connection, wallet.publicKey);
      setState((prev) => ({ 
        ...prev, 
        entries, 
        loading: false, 
        isInitialized: true 
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
    }
  }, [connection, wallet.publicKey]);

  // Check initialization status
  const checkInitialization = useCallback(async () => {
    if (!wallet.publicKey) {
      setState((prev) => ({ ...prev, isInitialized: false }));
      return;
    }

    try {
      const initialized = await isUserEntriesInitialized(connection, wallet.publicKey);
      setState((prev) => ({ ...prev, isInitialized: initialized }));
    } catch (err) {
      console.error("Error checking initialization:", err);
      setState((prev) => ({ ...prev, isInitialized: false }));
    }
  }, [connection, wallet.publicKey]);

  // Auto-refresh on wallet connection
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      checkInitialization();
      refreshEntries();
    } else {
      setState({ entries: [], loading: false, error: null, isInitialized: false });
    }
  }, [wallet.connected, wallet.publicKey, checkInitialization, refreshEntries]);

  return {
    // Operations
    initializeUser,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    refreshEntries,
    checkInitialization,

    // State
    entries: state.entries,
    loading: state.loading,
    error: state.error,
    isInitialized: state.isInitialized,

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
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshEntries = useCallback(async () => {
    if (!userPublicKey) return;

    try {
      setLoading(true);
      setError(null);
      
      // Check if user entries account is initialized
      const initialized = await isUserEntriesInitialized(connection, userPublicKey);
      setIsInitialized(initialized);
      
      if (!initialized) {
        setEntries([]);
        return;
      }

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
    isInitialized,
    refreshEntries,
  };
};

/**
 * Hook for getting user entries account data
 */
export const useUserEntriesAccount = (userPublicKey?: PublicKey) => {
  const { connection } = useConnection();
  const [accountData, setAccountData] = useState<UserCrudEntries | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshAccountData = useCallback(async () => {
    if (!userPublicKey) return;

    try {
      setLoading(true);
      setError(null);
      
      // Check if user entries account is initialized
      const initialized = await isUserEntriesInitialized(connection, userPublicKey);
      setIsInitialized(initialized);
      
      if (!initialized) {
        setAccountData(null);
        return;
      }

      const data = await getUserEntriesAccountData(connection, userPublicKey);
      setAccountData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [connection, userPublicKey]);

  useEffect(() => {
    if (userPublicKey) {
      refreshAccountData();
    }
  }, [userPublicKey, refreshAccountData]);

  return {
    accountData,
    loading,
    error,
    isInitialized,
    refreshAccountData,
  };
};
