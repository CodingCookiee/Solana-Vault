"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Text,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/common";
import { useSplTokens } from "@/services/spl-tokens";
import type { CreatedToken, TransactionResult } from "@/services/spl-tokens";
import {
  History,
  Coins,
  Wallet,
  Crown,
  ExternalLink,
  Copy,
  Zap,
  Trash2,
  Download,
  RefreshCw,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Archive,
  FileDown,
  X,
  Star,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface TokenHistoryProps {
  createdTokens: CreatedToken[];
  ownedTokens: CreatedToken[];
  onSelectToken: (mintAddress: string) => void;
  onRefresh: () => void;
  setStatus: (status: string) => void;
  loadingHistory: boolean;
}

interface TokenHistoryItemProps {
  token: CreatedToken;
  index: number;
  publicKey?: string;
  activeHistoryTab: "created" | "owned";
  onSelect: (mintAddress: string) => void;
  onClose: (mintAddress: string, tokenName: string) => void;
  closeLoading: boolean;
  setStatus: (status: string) => void;
}

const TokenHistoryItem: React.FC<TokenHistoryItemProps> = ({
  token,
  index,
  publicKey,
  activeHistoryTab,
  onSelect,
  onClose,
  closeLoading,
  setStatus,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const formatAddress = (address: string) => {
    if (address.length < 8) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const handleCloseConfirm = () => {
    setIsDialogOpen(false);
    onClose(token.mintAddress, token.name || "Unknown Token");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>

        <CardContent className="p-6">
          {/* Token Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {token.imageUrl ? (
                  <img
                    src={token.imageUrl}
                    alt={token.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 dark:border-purple-700"
                    onError={(e) => {
                      // Fallback to letter avatar if image fails to load
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden"
                      );
                    }}
                  />
                ) : null}
                <div
                  className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                    token.imageUrl ? "hidden" : ""
                  }`}
                >
                  {token.symbol?.charAt(0) || "T"}
                </div>
                {activeHistoryTab === "created" &&
                  token.mintAuthority === publicKey && (
                    <div className="absolute -top-1 -right-1 p-1 bg-yellow-500 rounded-full">
                      <Crown className="h-3 w-3 text-white" />
                    </div>
                  )}
              </div>

              <div className="flex-1 min-w-0">
                <Text variant="h5" weight="bold" className="truncate">
                  {token.name || "Unknown Token"}
                </Text>
                <div className="flex items-center space-x-3 mt-1">
                  <Text variant="small" color="muted">
                    {token.symbol || "N/A"} • {token.decimals} decimals
                  </Text>
                  {activeHistoryTab === "created" &&
                    token.mintAuthority === publicKey && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm">
                        <Crown className="h-3 w-3 mr-1" />
                        Mint Authority
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Token Description */}
          {token.description && (
            <div className="mb-4">
              <Text variant="small" color="muted" className="line-clamp-2">
                {token.description}
              </Text>
            </div>
          )}

          {/* Token Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-center space-x-2 mb-1">
                <Coins className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <Text
                  variant="extraSmall"
                  weight="medium"
                  className="text-purple-800 dark:text-purple-200"
                >
                  Total Supply
                </Text>
              </div>
              <Text
                variant="small"
                weight="bold"
                className="text-purple-700 dark:text-purple-300"
              >
                {token.totalSupply.toLocaleString()} {token.symbol}
              </Text>
            </div>

            {token.userBalance !== undefined && (
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center space-x-2 mb-1">
                  <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <Text
                    variant="extraSmall"
                    weight="medium"
                    className="text-green-800 dark:text-green-200"
                  >
                    Your Balance
                  </Text>
                </div>
                <Text
                  variant="small"
                  weight="bold"
                  className="text-green-700 dark:text-green-300"
                >
                  {token.userBalance.toLocaleString()} {token.symbol}
                </Text>
              </div>
            )}
          </div>

          {/* Mint Address */}
          <div className="mb-4">
            <Text
              variant="extraSmall"
              weight="medium"
              color="muted"
              className="mb-2 uppercase tracking-wide"
            >
              Mint Address
            </Text>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <Text variant="extraSmall" className="font-mono break-all pr-2">
                {token.mintAddress}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(
                    token.mintAddress,
                    "Address copied to clipboard!"
                  )
                }
                className="h-6 w-6 p-0 shrink-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Metadata URI */}
          {token.metadata?.uri && (
            <div className="mb-4">
              <Text
                variant="extraSmall"
                weight="medium"
                color="muted"
                className="mb-2 uppercase tracking-wide"
              >
                Metadata URI
              </Text>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <Text variant="extraSmall" className="break-all pr-2">
                  {token.metadata.uri}
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(token.metadata.uri, "_blank")}
                  className="h-6 w-6 p-0 shrink-0"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Creation Date */}
          {token.createdAt && (
            <div className="mb-4">
              <Text
                variant="extraSmall"
                color="muted"
                className="flex items-center space-x-2"
              >
                <History className="h-3 w-3" />
                <span>
                  Created on {new Date(token.createdAt).toLocaleDateString()}
                </span>
              </Text>
            </div>
          )}

          {/* Balance Warning */}
          <AnimatePresence>
            {token.userBalance && token.userBalance > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <Text
                        variant="small"
                        weight="medium"
                        className="text-amber-800 dark:text-amber-200"
                      >
                        Active Balance: {token.userBalance.toLocaleString()}{" "}
                        {token.symbol}
                      </Text>
                      <Text
                        variant="extraSmall"
                        className="text-amber-700 dark:text-amber-300 mt-1"
                      >
                        Transfer or burn tokens before closing the account
                      </Text>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                onSelect(token.mintAddress);
                toast.success("Token selected for operations");
              }}
              variant="outline"
              size="sm"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
            >
              <Zap className="h-3 w-3 mr-1" />
              Use Token
            </Button>

            <Button
              onClick={() =>
                window.open(
                  `https://explorer.solana.com/address/${token.mintAddress}?cluster=devnet`,
                  "_blank"
                )
              }
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Explorer
            </Button>

            <Button
              onClick={() =>
                copyToClipboard(token.mintAddress, "Token address copied!")
              }
              variant="outline"
              size="sm"
              className="border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900/20"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>

            {activeHistoryTab === "created" &&
              token.mintAuthority === publicKey && (
                <Button
                  onClick={() => {
                    onSelect(token.mintAddress);
                    document
                      .getElementById("mint-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                    toast.info("Scrolled to mint section");
                  }}
                  variant="outline"
                  size="sm"
                  className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Mint More
                </Button>
              )}

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  disabled={closeLoading}
                >
                  {closeLoading ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3 mr-1" />
                  )}
                  {activeHistoryTab === "created" ? "Remove" : "Close Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>
                      {activeHistoryTab === "created"
                        ? "Remove Token from List"
                        : "Close Token Account"}
                    </span>
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      {activeHistoryTab === "created"
                        ? `Are you sure you want to remove "${
                            token.name || "Unknown Token"
                          }" from your created tokens list?`
                        : `Are you sure you want to close the token account for "${
                            token.name || "Unknown Token"
                          }"?`}
                    </p>

                    {activeHistoryTab === "created" ? (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start space-x-2">
                          <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <Text
                              variant="small"
                              weight="medium"
                              className="text-blue-800 dark:text-blue-200"
                            >
                              Note: This only removes the token from your local
                              list
                            </Text>
                            <Text
                              variant="extraSmall"
                              className="text-blue-700 dark:text-blue-300 mt-1"
                            >
                              The actual token on the blockchain will not be
                              affected. You can re-add it later using the mint
                              address.
                            </Text>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div>
                              <Text
                                variant="small"
                                weight="medium"
                                className="text-amber-800 dark:text-amber-200"
                              >
                                Warning: Make sure your balance is 0 first
                              </Text>
                              <Text
                                variant="extraSmall"
                                className="text-amber-700 dark:text-amber-300 mt-1"
                              >
                                You cannot close an account with tokens still in
                                it. Transfer or burn all tokens first.
                              </Text>
                            </div>
                          </div>
                        </div>

                        {token.userBalance && token.userBalance > 0 && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-start space-x-2">
                              <X className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                              <div>
                                <Text
                                  variant="small"
                                  weight="medium"
                                  className="text-red-800 dark:text-red-200"
                                >
                                  Current Balance:{" "}
                                  {token.userBalance.toLocaleString()}{" "}
                                  {token.symbol}
                                </Text>
                                <Text
                                  variant="extraSmall"
                                  className="text-red-700 dark:text-red-300 mt-1"
                                >
                                  This operation will fail. Please transfer or
                                  burn your tokens first.
                                </Text>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Text
                        variant="extraSmall"
                        color="muted"
                        className="font-mono"
                      >
                        {formatAddress(token.mintAddress)}
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(token.mintAddress, "Address copied!")
                        }
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCloseConfirm}
                    className={
                      activeHistoryTab === "created"
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-red-500 hover:bg-red-600"
                    }
                  >
                    {activeHistoryTab === "created"
                      ? "Remove from List"
                      : "Close Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const TokenHistory: React.FC<TokenHistoryProps> = ({
  createdTokens,
  ownedTokens,
  onSelectToken,
  onRefresh,
  setStatus,
  loadingHistory,
}) => {
  const solana = useSplTokens();
  const [activeHistoryTab, setActiveHistoryTab] = useState<"created" | "owned">(
    "created"
  );
  const [closeLoading, setCloseLoading] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleCloseTokenAccount = async (
    mintAddress: string,
    tokenName: string
  ) => {
    try {
      setCloseLoading(true);
      setStatus("⏳ Closing token account...");

      if (activeHistoryTab === "created") {
        // Just remove from local storage for created tokens
        solana.removeCreatedTokenFromStorage(mintAddress);
        setStatus(`✅ ${tokenName} removed from created tokens list`);
        toast.success("Token removed from list successfully!");
      } else {
        // Actually close the token account for owned tokens
        const result = await solana.closeTokenAccount(mintAddress);
        if (result.success) {
          setStatus(
            `✅ Token account closed successfully: ${result.signature}`
          );
          toast.success("Token account closed successfully!");
        } else {
          handleResult(result, "");
          return; // Don't refresh if operation failed
        }
      }

      setTimeout(() => {
        onRefresh();
      }, 1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      toast.error(
        `Failed to ${
          activeHistoryTab === "created" ? "remove" : "close"
        }: ${errorMessage}`
      );
      console.error("Operation failed:", error);
    } finally {
      setCloseLoading(false);
    }
  };

  const handleResult = (result: TransactionResult, successMessage: string) => {
    if (result.success) {
      setStatus(`✅ ${successMessage}: ${result.signature}`);
      toast.success(successMessage);
    } else {
      setStatus(`❌ Error: ${result.error}`);
      toast.error(`Error: ${result.error}`);
    }
  };

  const handleExportTokens = () => {
    const exportData = {
      createdTokens,
      ownedTokens,
      exportedAt: new Date().toISOString(),
      wallet: solana.publicKey?.toBase58(),
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `solana-tokens-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Token data exported successfully!");
  };

  const handleClearCreatedTokens = () => {
    localStorage.removeItem("created-tokens");
    setClearDialogOpen(false);
    onRefresh();
    toast.success("Created tokens list cleared");
  };

  const copyAllAddresses = () => {
    const tokens = activeHistoryTab === "created" ? createdTokens : ownedTokens;
    const addresses = tokens.map((t) => t.mintAddress).join("\n");
    navigator.clipboard.writeText(addresses);
    toast.success("All token addresses copied to clipboard!");
  };

  const currentTokens =
    activeHistoryTab === "created" ? createdTokens : ownedTokens;
  const hasTokens = currentTokens.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm">
                <History className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>
                  <Text
                    variant="h5"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold"
                  >
                    Token History
                  </Text>
                </CardTitle>
                <Text variant="small" color="muted">
                  View and manage your token collection
                </Text>
              </div>
            </div>

            <Button
              onClick={onRefresh}
              disabled={loadingHistory}
              variant="outline"
              size="sm"
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
            >
              {loadingHistory ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveHistoryTab("created")}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeHistoryTab === "created"
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Crown className="h-4 w-4" />
                <span>Created Tokens ({createdTokens.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveHistoryTab("owned")}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeHistoryTab === "owned"
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Wallet className="h-4 w-4" />
                <span>Owned Tokens ({ownedTokens.length})</span>
              </div>
            </button>
          </div>

          {/* Tab Description */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <Text variant="small" color="muted">
              {activeHistoryTab === "created"
                ? "Tokens where you are the mint authority and can create additional supply"
                : "Tokens you currently hold in your wallet"}
            </Text>
            {activeHistoryTab === "created" && (
              <Text
                variant="extraSmall"
                color="muted"
                className="mt-1 flex items-center space-x-1"
              >
                <Shield className="h-3 w-3" />
                <span>
                  Created tokens are stored locally and may be lost if browser
                  data is cleared
                </span>
              </Text>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Token List */}
      <AnimatePresence mode="wait">
        {loadingHistory ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
              <CardContent className="p-12">
                <div className="relative mx-auto w-fit mb-4">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur"></div>
                  <div className="relative p-3 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-full">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <Text variant="body" color="muted">
                  Loading token history...
                </Text>
              </CardContent>
            </Card>
          </motion.div>
        ) : !hasTokens ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
              <CardContent className="p-12 text-center">
                <div className="relative mx-auto w-fit mb-4">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 opacity-20 blur"></div>
                  <div className="relative p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                    {activeHistoryTab === "created" ? (
                      <Plus className="h-8 w-8 text-gray-500" />
                    ) : (
                      <Wallet className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                </div>

                <Text
                  variant="h4"
                  color="muted"
                  weight="medium"
                  className="mb-2"
                >
                  {activeHistoryTab === "created"
                    ? "No tokens created yet"
                    : "No tokens owned yet"}
                </Text>
                <Text variant="body" color="muted" className="max-w-md mx-auto">
                  {activeHistoryTab === "created"
                    ? "Create your first token using the creation form above to see it listed here"
                    : "Create or receive some tokens to see them in your collection"}
                </Text>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="tokens"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {currentTokens.map((token, index) => (
              <TokenHistoryItem
                key={token.mintAddress}
                token={token}
                index={index}
                publicKey={solana.publicKey?.toBase58()}
                activeHistoryTab={activeHistoryTab}
                onSelect={onSelectToken}
                onClose={handleCloseTokenAccount}
                closeLoading={closeLoading}
                setStatus={setStatus}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats and Quick Actions */}
      <AnimatePresence>
        {!loadingHistory &&
          (createdTokens.length > 0 || ownedTokens.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Stats */}
              <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
                <CardContent className="p-4">
                  <Text variant="small" weight="medium" className="mb-3">
                    Token Portfolio Summary
                  </Text>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                      <Text
                        variant="h3"
                        weight="bold"
                        className="text-purple-600 dark:text-purple-400"
                      >
                        {createdTokens.length}
                      </Text>
                      <Text variant="small" color="muted">
                        Tokens Created
                      </Text>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                      <Text
                        variant="h3"
                        weight="bold"
                        className="text-blue-600 dark:text-blue-400"
                      >
                        {ownedTokens.length}
                      </Text>
                      <Text variant="small" color="muted">
                        Tokens Owned
                      </Text>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                <CardContent className="p-4">
                  <Text
                    variant="small"
                    weight="medium"
                    className="mb-3 flex items-center space-x-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>Quick Actions</span>
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={copyAllAddresses}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy All Addresses
                    </Button>

                    <Button
                      onClick={handleExportTokens}
                      variant="outline"
                      size="sm"
                      className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      <FileDown className="h-3 w-3 mr-1" />
                      Export Data
                    </Button>

                    {activeHistoryTab === "created" &&
                      createdTokens.length > 0 && (
                        <AlertDialog
                          open={clearDialogOpen}
                          onOpenChange={setClearDialogOpen}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                            >
                              <Archive className="h-3 w-3 mr-1" />
                              Clear List
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center space-x-2">
                                <Archive className="h-5 w-5 text-orange-500" />
                                <span>Clear Created Tokens List</span>
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to clear all created
                                tokens from your local storage? This will not
                                affect the actual tokens on the blockchain, but
                                you'll need to manually track them again.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleClearCreatedTokens}
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                Clear List
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
};
