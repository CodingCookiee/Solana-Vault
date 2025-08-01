"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSplTokens } from "@/services/spl-tokens";
import type { TokenInfo, MintInfo, CreatedToken } from "@/services/spl-tokens";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Text,
  Button,
} from "@/components/ui/common";

import { TokenCreationForm } from "./TokenCreationForm";
import { TokenOperations } from "./TokenOperations";
import { TokenApprovalOperations } from "./TokenApprovalOperations";
import { TokenInfoDisplay } from "./TokenInfoDisplay";
import { TokenHistory } from "./TokenHistory";
import { StatusDisplay } from "./StatusDisplay";
import { BalanceDisplay } from "./BalanceDisplay";

import {
  Coins,
  Sparkles,
  Zap,
  Shield,
  Database,
  History,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  RefreshCw,
  Star,
} from "lucide-react";
import { toast } from "sonner";

export const SPLProgramInteractions: React.FC = () => {
  const solana = useSplTokens();
  const [status, setStatus] = useState<string>("");
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Token operations
  const [tokenMint, setTokenMint] = useState<string>("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null);

  // Token history state
  const [createdTokens, setCreatedTokens] = useState<CreatedToken[]>([]);
  const [ownedTokens, setOwnedTokens] = useState<CreatedToken[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load initial data
  useEffect(() => {
    if (solana.connected && solana.isReady) {
      loadSOLBalance();
      loadTokenHistory();
    }
  }, [solana.connected, solana.isReady]);

  // Load token info when mint changes
  useEffect(() => {
    if (tokenMint && solana.isReady) {
      loadTokenInfo();
      loadMintInfo();
    }
  }, [tokenMint, solana.isReady]);

  // Helper functions
  const loadSOLBalance = async () => {
    if (!solana.isReady) {
      setStatus("❌ Wallet not ready");
      return;
    }

    try {
      setLoadingBalance(true);
      const balance = await solana.getSOLBalance();
      setSolBalance(balance);
    } catch (error) {
      console.error("Error loading SOL balance:", error);
      setStatus(
        `❌ Error loading SOL balance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoadingBalance(false);
    }
  };

  const loadTokenInfo = async () => {
    if (!tokenMint || !solana.isReady) return;

    try {
      const info = await solana.getTokenAccountInfo(tokenMint);
      setTokenInfo(info);
    } catch (error) {
      console.error("Error loading token info:", error);
    }
  };

  const loadMintInfo = async () => {
    if (!tokenMint || !solana.isReady) return;

    try {
      const info = await solana.getMintInfo(tokenMint);
      setMintInfo(info);
    } catch (error) {
      console.error("Error loading mint info:", error);
    }
  };

  const loadTokenHistory = async () => {
    if (!solana.isReady) return;

    try {
      setLoadingHistory(true);
      const [created, owned] = await Promise.all([
        solana.getCreatedTokens(),
        solana.getOwnedTokens(),
      ]);
      setCreatedTokens(created);
      setOwnedTokens(owned);
    } catch (error) {
      console.error("Error loading token history:", error);
      setStatus(
        `❌ Error loading token history: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  const refreshData = () => {
    loadSOLBalance();
    loadTokenHistory();
    if (tokenMint) {
      loadTokenInfo();
      loadMintInfo();
    }
    toast.success("Data refreshed successfully!");
  };

  const handleTokenCreated = (mintAddress: string) => {
    setTokenMint(mintAddress);
    toast.success("Token created and selected!");
    // Refresh data after token creation
    setTimeout(refreshData, 2000);
  };

  const copyTokenAddress = () => {
    navigator.clipboard.writeText(tokenMint);
    toast.success("Token address copied to clipboard!");
  };

  const openInExplorer = () => {
    window.open(
      `https://explorer.solana.com/address/${tokenMint}?cluster=devnet`,
      "_blank"
    );
  };

  // Show loading state if wallet is not ready
  if (!solana.connected) {
    return (
      <AuthGate>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border border-amber-200 dark:border-amber-800 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400"></div>
            <CardContent className="p-12 text-center">
              <div className="relative mx-auto w-fit mb-6">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-20 blur"></div>
                <div className="relative p-4 bg-amber-100/50 dark:bg-amber-900/30 rounded-full">
                  <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <Text
                variant="h3"
                className="mb-3 text-amber-800 dark:text-amber-200 font-bold"
              >
                Wallet Connection Required
              </Text>
              <Text variant="body" color="muted" className="max-w-md mx-auto">
                Please connect your wallet to access SPL Token creation and
                management features
              </Text>
            </CardContent>
          </Card>
        </motion.div>
      </AuthGate>
    );
  }

  if (!solana.isReady) {
    return (
      <AuthGate>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border border-blue-200 dark:border-blue-800 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
            <CardContent className="p-12 text-center">
              <div className="relative mx-auto w-fit mb-6">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur"></div>
                <div className="relative p-4 bg-blue-100/50 dark:bg-blue-900/30 rounded-full">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <Text
                variant="h3"
                className="mb-3 text-blue-800 dark:text-blue-200 font-bold"
              >
                Initializing Connection
              </Text>
              <Text variant="body" color="muted" className="max-w-md mx-auto">
                Setting up your wallet connection and loading SPL token
                capabilities...
              </Text>
            </CardContent>
          </Card>
        </motion.div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="relative mx-auto w-fit">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-20 blur-xl"></div>
            <div className="relative p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full shadow-2xl">
              <Coins className="h-12 w-12 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <Text
              variant="h1"
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent font-bold"
            >
              SPL Token Creator
            </Text>
            <Text variant="large" color="muted" className="max-w-3xl mx-auto">
              Create, manage, and interact with SPL tokens on Solana. Deploy
              custom tokens with metadata, manage supply, handle approvals, and
              track your token portfolio.
            </Text>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
              <Text
                variant="h3"
                className="text-purple-600 dark:text-purple-400 font-bold"
              >
                {createdTokens.length}
              </Text>
              <Text variant="small" color="muted">
                Created Tokens
              </Text>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
              <Text
                variant="h3"
                className="text-blue-600 dark:text-blue-400 font-bold"
              >
                {ownedTokens.length}
              </Text>
              <Text variant="small" color="muted">
                Owned Tokens
              </Text>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
              <Text
                variant="h3"
                className="text-green-600 dark:text-green-400 font-bold"
              >
                {solBalance !== null ? solBalance.toFixed(2) : "-.--"}
              </Text>
              <Text variant="small" color="muted">
                SOL Balance
              </Text>
            </div>
          </div>

          {/* Global Refresh */}
          <div className="flex justify-center">
            <Button
              onClick={refreshData}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All Data
            </Button>
          </div>
        </motion.div>

        {/* Balance Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <BalanceDisplay solBalance={solBalance} loading={loadingBalance} />
        </motion.div>

        {/* Token History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TokenHistory
            createdTokens={createdTokens}
            ownedTokens={ownedTokens}
            onSelectToken={setTokenMint}
            onRefresh={loadTokenHistory}
            setStatus={setStatus}
            loadingHistory={loadingHistory}
          />
        </motion.div>

        {/* Operations Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Token Creation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden h-full">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>
                      <Text
                        variant="h4"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold"
                      >
                        1. Create Token
                      </Text>
                    </CardTitle>
                    <CardDescription>
                      <Text variant="small" color="muted">
                        Deploy a new SPL token with custom metadata and initial
                        supply
                      </Text>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <TokenCreationForm
                  onTokenCreated={handleTokenCreated}
                  setStatus={setStatus}
                />

                {/* Selected Token Display */}
                <AnimatePresence>
                  {tokenMint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <Text
                              variant="small"
                              weight="medium"
                              className="text-amber-800 dark:text-amber-200"
                            >
                              Selected Token
                            </Text>
                          </div>

                          <div className="space-y-3">
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700">
                              <Text
                                variant="extraSmall"
                                color="muted"
                                className="mb-1"
                              >
                                Mint Address:
                              </Text>
                              <Text
                                variant="small"
                                className="font-mono break-all"
                              >
                                {tokenMint}
                              </Text>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                onClick={openInExplorer}
                                variant="outline"
                                size="sm"
                                className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Explorer
                              </Button>
                              <Button
                                onClick={copyTokenAddress}
                                variant="outline"
                                size="sm"
                                className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Token Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden h-full">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>
                      <Text
                        variant="h4"
                        className="text-blue-600 dark:text-blue-400 font-bold"
                      >
                        Token Information
                      </Text>
                    </CardTitle>
                    <CardDescription>
                      <Text variant="small" color="muted">
                        View detailed information about your selected token
                      </Text>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <AnimatePresence mode="wait">
                  {tokenMint && (tokenInfo || mintInfo) ? (
                    <motion.div
                      key="token-info"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TokenInfoDisplay
                        tokenInfo={tokenInfo}
                        mintInfo={mintInfo}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-token"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="py-12 text-center"
                    >
                      <div className="relative mx-auto w-fit mb-4">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 opacity-20 blur"></div>
                        <div className="relative p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <Database className="h-8 w-8 text-gray-500" />
                        </div>
                      </div>
                      <Text
                        variant="body"
                        color="muted"
                        weight="medium"
                        className="mb-2"
                      >
                        No Token Selected
                      </Text>
                      <Text variant="small" color="muted">
                        Create a new token or select one from your history to
                        view details
                      </Text>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Token Operations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>

            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 shadow-sm">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>
                    <Text
                      variant="h4"
                      className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-bold"
                    >
                      2. Token Operations
                    </Text>
                  </CardTitle>
                  <CardDescription>
                    <Text variant="small" color="muted">
                      Mint additional tokens, transfer to other wallets, and
                      burn supply
                    </Text>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <TokenOperations
                tokenMint={tokenMint}
                setStatus={setStatus}
                onOperationComplete={refreshData}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Token Approval Operations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>

            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 shadow-sm">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>
                    <Text
                      variant="h4"
                      className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-bold"
                    >
                      3. Advanced Operations
                    </Text>
                  </CardTitle>
                  <CardDescription>
                    <Text variant="small" color="muted">
                      Manage token approvals and delegate spending permissions
                    </Text>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <TokenApprovalOperations
                tokenMint={tokenMint}
                setStatus={setStatus}
                onOperationComplete={refreshData}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Display */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StatusDisplay status={status} onClear={() => setStatus("")} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AuthGate>
  );
};
