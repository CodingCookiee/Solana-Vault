"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Text,
  Card,
  CardContent,
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
import type { CreatedToken } from "@/services/spl-tokens";
import { Copy, FileDown, Archive, Star } from "lucide-react";
import { toast } from "sonner";

interface TokenHistoryStatsProps {
  createdTokens: CreatedToken[];
  ownedTokens: CreatedToken[];
  activeTab: "created" | "owned";
  loadingHistory: boolean;
  walletPublicKey?: string;
  onClearCreatedTokens: () => void;
}

export const TokenHistoryStats: React.FC<TokenHistoryStatsProps> = ({
  createdTokens,
  ownedTokens,
  activeTab,
  loadingHistory,
  walletPublicKey,
  onClearCreatedTokens,
}) => {
  const [clearDialogOpen, setClearDialogOpen] = React.useState(false);

  const handleExportTokens = () => {
    const exportData = {
      createdTokens,
      ownedTokens,
      exportedAt: new Date().toISOString(),
      wallet: walletPublicKey,
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

  const copyAllAddresses = () => {
    const tokens = activeTab === "created" ? createdTokens : ownedTokens;
    const addresses = tokens.map((t) => t.mintAddress).join("\n");
    navigator.clipboard.writeText(addresses);
    toast.success("All token addresses copied to clipboard!");
  };

  const handleClearConfirm = () => {
    onClearCreatedTokens();
    setClearDialogOpen(false);
  };

  if (
    loadingHistory ||
    (createdTokens.length === 0 && ownedTokens.length === 0)
  ) {
    return null;
  }

  return (
    <AnimatePresence>
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

              {activeTab === "created" && createdTokens.length > 0 && (
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
                        Are you sure you want to clear all created tokens from
                        your local storage? This will not affect the actual
                        tokens on the blockchain, but you'll need to manually
                        track them again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearConfirm}
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
    </AnimatePresence>
  );
};
