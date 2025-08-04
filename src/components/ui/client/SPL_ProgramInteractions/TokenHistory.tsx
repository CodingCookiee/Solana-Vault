"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Text,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common";
import { useSplTokens } from "@/services/spl-tokens";
import type { CreatedToken, TransactionResult } from "@/services/spl-tokens";
import { History, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Import the new components
import { TokenHistoryItem } from "./TokenHistoryItem";
import { TokenHistoryTabs } from "./TokenHistoryTabs";
import { TokenHistoryStats } from "./TokenHistoryStats";
import { TokenHistoryEmpty } from "./TokenHistoryEmpty";

interface TokenHistoryProps {
  createdTokens: CreatedToken[];
  ownedTokens: CreatedToken[];
  onSelectToken: (mintAddress: string) => void;
  onRefresh: () => void;
  setStatus: (status: string) => void;
  loadingHistory: boolean;
  selectedTokenMint?: string; // Add prop to track selected token
}

export const TokenHistory: React.FC<TokenHistoryProps> = ({
  createdTokens,
  ownedTokens,
  onSelectToken,
  onRefresh,
  setStatus,
  loadingHistory,
  selectedTokenMint, // Add this to track the currently selected token
}) => {
  const solana = useSplTokens();
  const [activeHistoryTab, setActiveHistoryTab] = useState<"created" | "owned">(
    "created"
  );
  const [closeLoading, setCloseLoading] = useState(false);

  // Switch to appropriate tab if a token is selected and it exists in one of the lists
  useEffect(() => {
    if (selectedTokenMint) {
      // Check if the selected token is in the created tokens
      const inCreated = createdTokens.some(
        (token) => token.mintAddress === selectedTokenMint
      );

      // Check if the selected token is in the owned tokens
      const inOwned = ownedTokens.some(
        (token) => token.mintAddress === selectedTokenMint
      );

      // Switch to the appropriate tab
      if (inCreated && activeHistoryTab !== "created") {
        setActiveHistoryTab("created");
      } else if (inOwned && activeHistoryTab !== "owned") {
        setActiveHistoryTab("owned");
      }
    }
  }, [selectedTokenMint, createdTokens, ownedTokens, ]);

  const handleCloseTokenAccount = async (
    mintAddress: string,
    tokenName: string
  ) => {
    try {
      setCloseLoading(true);
      setStatus("⏳ Processing request...");

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

  const handleClearCreatedTokens = () => {
    localStorage.removeItem("created-tokens");
    onRefresh();
    toast.success("Created tokens list cleared");
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
          <TokenHistoryTabs
            activeTab={activeHistoryTab}
            onTabChange={setActiveHistoryTab}
            createdTokens={createdTokens}
            ownedTokens={ownedTokens}
          />
        </CardContent>
      </Card>

      {/* Token List */}
      <AnimatePresence mode="wait">
        {!hasTokens ? (
          <TokenHistoryEmpty
            activeTab={activeHistoryTab}
            loading={loadingHistory}
          />
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
                isSelected={token.mintAddress === selectedTokenMint}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats and Quick Actions */}
      <TokenHistoryStats
        createdTokens={createdTokens}
        ownedTokens={ownedTokens}
        activeTab={activeHistoryTab}
        loadingHistory={loadingHistory}
        walletPublicKey={solana.publicKey?.toBase58()}
        onClearCreatedTokens={handleClearCreatedTokens}
      />
    </motion.div>
  );
};
