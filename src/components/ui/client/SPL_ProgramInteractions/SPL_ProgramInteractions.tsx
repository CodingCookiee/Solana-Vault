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
  CardFooter,
  Text,
  Button,
} from "@/components/ui/common";
import Link from "next/link";

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
  ArrowLeft,
  Info,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// Define tab types
type ActiveTab = "my-tokens" | "create" | "operations" | "advanced";

export const SPLProgramInteractions: React.FC = () => {
  const solana = useSplTokens();
  const [status, setStatus] = useState<string>("");
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>("my-tokens");

  // Token operations
  const [tokenMint, setTokenMint] = useState<string>("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null);
  const [loadingTokenInfo, setLoadingTokenInfo] = useState(false);

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
    } else {
      // Clear token info if no tokenMint is selected
      setTokenInfo(null);
      setMintInfo(null);
    }
  }, [tokenMint, solana.isReady]);

  // Define tabs config
  const tabs = [
    {
      id: "my-tokens" as ActiveTab,
      label: "My Tokens",
      icon: <History className="h-4 w-4" />,
      description: "View and manage your token collection",
      color: "from-purple-500 to-pink-500",
      gradient: "from-purple-600 to-pink-600",
    },
    {
      id: "create" as ActiveTab,
      label: "Create Token",
      icon: <Sparkles className="h-4 w-4" />,
      description: "Create new SPL tokens with custom metadata",
      color: "from-indigo-500 to-blue-500",
      gradient: "from-indigo-600 to-blue-600",
    },
    {
      id: "operations" as ActiveTab,
      label: "Operations",
      icon: <Zap className="h-4 w-4" />,
      description: "Mint, transfer, and burn tokens",
      color: "from-green-500 to-emerald-500",
      gradient: "from-green-600 to-emerald-600",
    },
    {
      id: "advanced" as ActiveTab,
      label: "Advanced",
      icon: <Shield className="h-4 w-4" />,
      description: "Manage token approvals and delegations",
      color: "from-amber-500 to-orange-500",
      gradient: "from-amber-600 to-orange-600",
    },
  ];

  // Find the active tab
  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const handleSelectToken = (mintAddress: string) => {
    // Only update if it's a different token
    if (mintAddress !== tokenMint) {
      // Set loading state first
      setTokenInfo(null);
      setMintInfo(null);
      setLoadingTokenInfo(true);
      setTokenMint(mintAddress);
      toast.success("Token selected for operations");
    }
  };

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
      setLoadingTokenInfo(true);
      const info = await solana.getTokenAccountInfo(tokenMint);
      setTokenInfo(info);
    } catch (error) {
      console.error("Error loading token info:", error);
      setTokenInfo(null);
    } finally {
      setLoadingTokenInfo(false);
    }
  };

  const loadMintInfo = async () => {
    if (!tokenMint || !solana.isReady) return;

    try {
      setLoadingTokenInfo(true);
      const info = await solana.getMintInfo(tokenMint);
      setMintInfo(info);
    } catch (error) {
      console.error("Error loading mint info:", error);
      setMintInfo(null);
    } finally {
      setLoadingTokenInfo(false);
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
    setTimeout(() => {
      refreshData();
      // Switch to operations tab after creating
      setActiveTab("operations");
    }, 2000);
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
        {/* Back to Home */}
        <div className="flex justify-between items-center">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header Card */}
        <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>

          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 shadow-sm">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>
                  <Text
                    variant="h3"
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent font-bold"
                  >
                    SPL Token Studio
                  </Text>
                </CardTitle>
                <CardDescription>
                  <Text variant="body" color="muted">
                    Create, manage, and interact with SPL tokens on Solana.
                    Deploy custom tokens with metadata, manage supply, handle
                    approvals, and track your token portfolio.
                  </Text>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Selected Token Display */}
        <AnimatePresence>
          {tokenMint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-400 to-yellow-400"></div>

                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 shadow-sm">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle>
                      <Text
                        variant="h6"
                        className="text-amber-600 dark:text-amber-400 font-bold"
                      >
                        Selected Token
                      </Text>
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700">
                    <Text variant="extraSmall" color="muted" className="mb-1">
                      Mint Address:
                    </Text>
                    <Text variant="small" className="font-mono break-all">
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
                    {activeTab !== "operations" && (
                      <Button
                        onClick={() => setActiveTab("operations")}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Operations
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Balance Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <BalanceDisplay solBalance={solBalance} loading={loadingBalance} />
        </motion.div>

        {/* Tab Navigation Card */}
        <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto scrollbar-none pt-4 px-4">
              {tabs.map((tab) => {
                // Dynamic classes based on active state
                const isActive = activeTab === tab.id;

                // Determine tab colors
                const bgGradient = isActive
                  ? `bg-gradient-to-r ${tab.color}`
                  : "bg-gray-200 dark:bg-gray-700";

                const textColor = isActive
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-400";

                const hoverClasses = isActive
                  ? ""
                  : "hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50";

                return (
                  <div
                    key={tab.id}
                    className={`relative flex-1 min-w-[120px] pb-4 cursor-pointer ${hoverClasses}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 mb-2 flex items-center justify-center rounded-lg shadow-md ${bgGradient} ${textColor}`}
                      >
                        {tab.icon}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isActive
                            ? `bg-gradient-to-r ${tab.gradient} bg-clip-text text-transparent`
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {tab.label}
                      </span>
                    </div>
                    {/* Bottom border indicator */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 ${
                        isActive ? bgGradient : "bg-transparent"
                      }`}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Tab Description */}
          {activeTabData && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Text variant="small" color="muted">
                  {activeTabData.description}
                </Text>
                {activeTab !== "my-tokens" && (
                  <Button
                    onClick={refreshData}
                    variant="outline"
                    size="sm"
                    className="ml-auto border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/50"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh Data
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === "my-tokens" && (
              <motion.div
                key="my-tokens"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TokenHistory
                  createdTokens={createdTokens}
                  ownedTokens={ownedTokens}
                  onSelectToken={handleSelectToken}
                  onRefresh={loadTokenHistory}
                  setStatus={setStatus}
                  loadingHistory={loadingHistory}
                  selectedTokenMint={tokenMint}
                />
              </motion.div>
            )}

            {activeTab === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden h-full">
                  <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>

                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 shadow-sm">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>
                          <Text
                            variant="h4"
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent font-bold"
                          >
                            Create Token
                          </Text>
                        </CardTitle>
                        <CardDescription>
                          <Text variant="small" color="muted">
                            Deploy a new SPL token with custom metadata and
                            initial supply
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
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "operations" && (
              <motion.div
                key="operations"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-8">
                  {/* Token Information */}
                  <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden h-full">
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
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
                                View detailed information about your selected
                                token
                              </Text>
                            </CardDescription>
                          </div>
                        </div>
                        {tokenMint && (
                          <Button
                            onClick={() => {
                              loadTokenInfo();
                              loadMintInfo();
                            }}
                            disabled={loadingTokenInfo}
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          >
                            {loadingTokenInfo ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <AnimatePresence mode="wait">
                        {loadingTokenInfo ? (
                          <motion.div
                            key="loading-token-info"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-center items-center py-16"
                          >
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          </motion.div>
                        ) : tokenMint && (tokenInfo || mintInfo) ? (
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
                              Create a new token or select one from your history
                              to view details
                            </Text>
                            <div className="mt-4">
                              <Button
                                onClick={() => setActiveTab("my-tokens")}
                                variant="outline"
                                size="sm"
                                className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                              >
                                <History className="h-3 w-3 mr-2" />
                                Go to My Tokens
                                <ChevronRight className="ml-1 h-3 w-3" />
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>

                  {/* Token Operations */}
                  <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>

                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle>
                            <Text
                              variant="h4"
                              className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold"
                            >
                              Token Operations
                            </Text>
                          </CardTitle>
                          <CardDescription>
                            <Text variant="small" color="muted">
                              Mint additional tokens, transfer to other wallets,
                              and burn supply
                            </Text>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <TokenOperations
                        tokenMint={tokenMint}
                        tokenInfo={tokenInfo}
                        mintInfo={mintInfo}
                        setStatus={setStatus}
                        onOperationComplete={refreshData}
                        loading={loadingTokenInfo}
                      />
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === "advanced" && (
              <motion.div
                key="advanced"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>

                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>
                          <Text
                            variant="h4"
                            className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-bold"
                          >
                            Advanced Operations
                          </Text>
                        </CardTitle>
                        <CardDescription>
                          <Text variant="small" color="muted">
                            Manage token approvals and delegate spending
                            permissions
                          </Text>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <TokenApprovalOperations
                      tokenMint={tokenMint}
                      tokenInfo={tokenInfo}
                      setStatus={setStatus}
                      onOperationComplete={refreshData}
                      loading={loadingTokenInfo}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* How It Works Card */}
        <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"></div>

          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 shadow-sm">
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              <CardTitle>
                <Text
                  variant="h5"
                  className="text-gray-700 dark:text-gray-300 font-bold"
                >
                  How It Works
                </Text>
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <Text variant="small" color="muted" className="mb-6">
              All your token operations interact directly with the Solana
              blockchain through your connected wallet. Basic information about
              created and owned tokens is stored locally for your convenience.
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div className="relative">
                <div className="absolute top-0 left-6 h-full border-l-2 border-dashed border-gray-300 dark:border-gray-600 z-0"></div>
                <div className="relative z-10 flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-lg">
                    1
                  </div>
                  <div className="space-y-2 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 p-4 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                    <Text
                      variant="small"
                      weight="semibold"
                      className="text-indigo-700 dark:text-indigo-300"
                    >
                      Create Token
                    </Text>
                    <Text variant="small" color="muted">
                      Start by creating an SPL token with custom metadata and
                      initial supply. This deploys a new token to the Solana
                      blockchain.
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("create")}
                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20 mt-2"
                    >
                      <Sparkles className="h-3 w-3 mr-2" />
                      Create Token
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-0 left-6 h-full border-l-2 border-dashed border-gray-300 dark:border-gray-600 z-0"></div>
                <div className="relative z-10 flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-lg">
                    2
                  </div>
                  <div className="space-y-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-4 rounded-lg border border-green-200/50 dark:border-green-800/50">
                    <Text
                      variant="small"
                      weight="semibold"
                      className="text-green-700 dark:text-green-300"
                    >
                      Manage Operations
                    </Text>
                    <Text variant="small" color="muted">
                      Perform basic token operations like minting, transferring,
                      and burning. These operations change token balances and
                      supply.
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("operations")}
                      className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20 mt-2"
                    >
                      <Zap className="h-3 w-3 mr-2" />
                      Token Operations
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10 flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-lg">
                    3
                  </div>
                  <div className="space-y-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-4 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                    <Text
                      variant="small"
                      weight="semibold"
                      className="text-amber-700 dark:text-amber-300"
                    >
                      Advanced Functions
                    </Text>
                    <Text variant="small" color="muted">
                      Set up advanced features like delegation and approvals to
                      allow others to transfer tokens on your behalf.
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("advanced")}
                      className="border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20 mt-2"
                    >
                      <Shield className="h-3 w-3 mr-2" />
                      Advanced Features
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Info className="h-3 w-3 mr-1" />
              <span>
                Creating and managing tokens incurs network fees. Make sure you
                have enough SOL in your wallet.
              </span>
            </div>
          </CardFooter>
        </Card>

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
