import { useState, useCallback, useEffect } from "react";
import { useConnection, useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  initializeUser,
  buySol,
  sellSol,
  provideLiquidity,
  withdrawLiquidity,
  transferAsset,
  sendMessage,
  getPoolInfo,
  getUserBalance,
  getTradeQuote,
  getUserAccountState,
  validateSwapParams,
  validateLiquidityParams,
} from "./dex.service";
import {
  DexServiceResult,
  SwapParams,
  LiquidityParams,
  AssetTransferParams,
  MessageParams,
  PoolInfo,
  UserBalance,
  TradeQuote,
  AccountState,
} from "./dex.types";

/**
 * Hook for DeFi/DEX operations
 */
export const useDexService = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [accountState, setAccountState] = useState<AccountState>({
    isInitialized: false,
  });

  // Initialize user account
  const initUser = useCallback(async (): Promise<DexServiceResult> => {
    if (!wallet.connected || !wallet.publicKey || !anchorWallet) {
      const result: DexServiceResult = {
        signature: "",
        success: false,
        error: "Wallet not connected or anchor wallet not available",
      };
      setError("Wallet not connected or anchor wallet not available");
      return result;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await initializeUser(connection, anchorWallet);

      if (!result.success) {
        setError(result.error || "Failed to initialize user");
      } else {
        // Refresh account state after initialization
        await refreshAccountState();
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return {
        signature: "",
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, [connection, wallet, anchorWallet]);

  // Buy SOL with SFC
  const buySOL = useCallback(
    async (params: SwapParams): Promise<DexServiceResult> => {
      if (!wallet.connected || !wallet.publicKey || !anchorWallet) {
        const result: DexServiceResult = {
          signature: "",
          success: false,
          error: "Wallet not connected or anchor wallet not available",
        };
        setError("Wallet not connected or anchor wallet not available");
        return result;
      }

      const validation = validateSwapParams(params);
      if (!validation.valid) {
        const result: DexServiceResult = {
          signature: "",
          success: false,
          error: validation.error,
        };
        setError(validation.error || "Invalid parameters");
        return result;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await buySol(connection, anchorWallet, params);

        if (!result.success) {
          setError(result.error || "Failed to buy SOL");
        } else {
          // Refresh balances after successful trade
          await refreshUserBalance();
          await refreshPoolInfo();
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
    [connection, wallet, anchorWallet]
  );

  // Sell SOL for SFC
  const sellSOL = useCallback(
    async (
      params: SwapParams & { bump: number }
    ): Promise<DexServiceResult> => {
      if (!wallet.connected || !wallet.publicKey || !anchorWallet) {
        const result: DexServiceResult = {
          signature: "",
          success: false,
          error: "Wallet not connected or anchor wallet not available",
        };
        setError("Wallet not connected or anchor wallet not available");
        return result;
      }

      const validation = validateSwapParams(params);
      if (!validation.valid) {
        const result: DexServiceResult = {
          signature: "",
          success: false,
          error: validation.error,
        };
        setError(validation.error || "Invalid parameters");
        return result;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await sellSol(connection, anchorWallet, params);

        if (!result.success) {
          setError(result.error || "Failed to sell SOL");
        } else {
          // Refresh balances after successful trade
          await refreshUserBalance();
          await refreshPoolInfo();
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
    [connection, wallet, anchorWallet]
  );

  // Provide liquidity
  const addLiquidity = useCallback(
    async (params: LiquidityParams): Promise<DexServiceResult> => {
      if (!wallet.connected || !wallet.publicKey || !anchorWallet) {
        const result: DexServiceResult = {
          signature: "",
          success: false,
          error: "Wallet not connected or anchor wallet not available",
        };
        setError("Wallet not connected or anchor wallet not available");
        return result;
      }

      const validation = validateLiquidityParams(params);
      if (!validation.valid) {
        const result: DexServiceResult = {
          signature: "",
          success: false,
          error: validation.error,
        };
        setError(validation.error || "Invalid parameters");
        return result;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await provideLiquidity(
          connection,
          anchorWallet,
          params
        );

        if (!result.success) {
          setError(result.error || "Failed to provide liquidity");
        } else {
          // Refresh balances after successful operation
          await refreshUserBalance();
          await refreshPoolInfo();
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
    [connection, wallet, anchorWallet]
  );

  // Remove liquidity
  const removeLiquidity = useCallback(
    async (params: LiquidityParams): Promise<DexServiceResult> => {
      if (!wallet.connected || !wallet.publicKey || !anchorWallet) {
        const result: DexServiceResult = {
          signature: "",
          success: false,
          error: "Wallet not connected or anchor wallet not available",
        };
        setError("Wallet not connected or anchor wallet not available");
        return result;
      }

      const validation = validateLiquidityParams(params);
      if (!validation.valid) {
        const result: DexServiceResult = {
          signature: "",
          success: false,
          error: validation.error,
        };
        setError(validation.error || "Invalid parameters");
        return result;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await withdrawLiquidity(
          connection,
          anchorWallet,
          params
        );

        if (!result.success) {
          setError(result.error || "Failed to withdraw liquidity");
        } else {
          // Refresh balances after successful operation
          await refreshUserBalance();
          await refreshPoolInfo();
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
    [connection, wallet, anchorWallet]
  );

  // Transfer assets
  const transferAssets = useCallback(
    async (params: AssetTransferParams): Promise<DexServiceResult> => {
      if (!wallet.connected || !wallet.publicKey || !anchorWallet) {
        const result: DexServiceResult = {
          signature: "",
          success: false,
          error: "Wallet not connected or anchor wallet not available",
        };
        setError("Wallet not connected or anchor wallet not available");
        return result;
      }

      if (params.amount <= 0) {
        const result: DexServiceResult = {
          signature: "",
          success: false,
          error: "Amount must be greater than 0",
        };
        setError("Amount must be greater than 0");
        return result;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await transferAsset(connection, anchorWallet, params);

        if (!result.success) {
          setError(result.error || "Failed to transfer assets");
        } else {
          // Refresh balances after successful transfer
          await refreshUserBalance();
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
    [connection, wallet, anchorWallet]
  );

  // Send message
  const sendUserMessage = useCallback(
    async (params: MessageParams): Promise<DexServiceResult> => {
      if (!wallet.connected || !wallet.publicKey || !anchorWallet) {
        const result: DexServiceResult = {
          signature: "",
          success: false,
          error: "Wallet not connected or anchor wallet not available",
        };
        setError("Wallet not connected or anchor wallet not available");
        return result;
      }

      if (!params.message.trim()) {
        const result: DexServiceResult = {
          signature: "",
          success: false,
          error: "Message cannot be empty",
        };
        setError("Message cannot be empty");
        return result;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await sendMessage(connection, anchorWallet, params);

        if (!result.success) {
          setError(result.error || "Failed to send message");
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
    [connection, wallet, anchorWallet]
  );

  // Get trade quote
  const getQuote = useCallback(
    async (
      inputAmount: number,
      isSOLtoSFC: boolean
    ): Promise<TradeQuote | null> => {
      try {
        return await getTradeQuote(connection, inputAmount, isSOLtoSFC);
      } catch (err) {
        console.error("Error getting quote:", err);
        return null;
      }
    },
    [connection]
  );

  // Refresh functions
  const refreshPoolInfo = useCallback(async () => {
    try {
      const info = await getPoolInfo(connection);
      setPoolInfo(info);
    } catch (err) {
      console.error("Error refreshing pool info:", err);
    }
  }, [connection]);

  const refreshUserBalance = useCallback(async () => {
    if (!wallet.publicKey) return;

    try {
      const balance = await getUserBalance(connection, wallet.publicKey);
      setUserBalance(balance);
    } catch (err) {
      console.error("Error refreshing user balance:", err);
    }
  }, [connection, wallet.publicKey]);

  const refreshAccountState = useCallback(async () => {
    if (!wallet.publicKey) return;

    try {
      const state = await getUserAccountState(connection, wallet.publicKey);
      setAccountState(state);
    } catch (err) {
      console.error("Error refreshing account state:", err);
    }
  }, [connection, wallet.publicKey]);

  // Auto-refresh on wallet connection
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      refreshPoolInfo();
      refreshUserBalance();
      refreshAccountState();
    }
  }, [
    wallet.connected,
    wallet.publicKey,
    refreshPoolInfo,
    refreshUserBalance,
    refreshAccountState,
  ]);

  return {
    // Operations
    initUser,
    buySOL,
    sellSOL,
    addLiquidity,
    removeLiquidity,
    transferAssets,
    sendUserMessage,
    getQuote,

    // Refresh functions
    refreshPoolInfo,
    refreshUserBalance,
    refreshAccountState,

    // State
    poolInfo,
    userBalance,
    accountState,
    loading,
    error,

    // Utility
    clearError: () => setError(null),
    isWalletConnected: wallet.connected,
    userPublicKey: wallet.publicKey,
  };
};

/**
 * Hook for pool information only
 */
export const usePoolInfo = () => {
  const { connection } = useConnection();
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPoolInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await getPoolInfo(connection);
      setPoolInfo(info);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    refreshPoolInfo();
  }, [refreshPoolInfo]);

  return {
    poolInfo,
    loading,
    error,
    refreshPoolInfo,
  };
};

/**
 * Hook for user balance only
 */
export const useUserBalance = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUserBalance = useCallback(async () => {
    if (!wallet.publicKey) return;

    try {
      setLoading(true);
      setError(null);
      const balance = await getUserBalance(connection, wallet.publicKey);
      setUserBalance(balance);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [connection, wallet.publicKey]);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      refreshUserBalance();
    }
  }, [wallet.connected, wallet.publicKey, refreshUserBalance]);

  return {
    userBalance,
    loading,
    error,
    refreshUserBalance,
  };
};
