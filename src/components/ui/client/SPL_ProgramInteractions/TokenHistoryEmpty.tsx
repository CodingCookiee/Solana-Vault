"use client";

import React from "react";
import { motion } from "framer-motion";
import { Text, Card, CardContent } from "@/components/ui/common";
import { Plus, Wallet, Loader2 } from "lucide-react";

interface TokenHistoryEmptyProps {
  activeTab: "created" | "owned";
  loading: boolean;
}

export const TokenHistoryEmpty: React.FC<TokenHistoryEmptyProps> = ({
  activeTab,
  loading,
}) => {
  if (loading) {
    return (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-center py-12"
      >
        <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
          <CardContent className="p-12 flex items-center justify-center gap-5">
            <Text variant="h4" color="muted" weight="medium" className="mb-2">
              Loading your token history...
            </Text>
            <div className="relative  mb-4">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur"></div>
              <div className="relative p-3 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-full">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
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
              {activeTab === "created" ? (
                <Plus className="h-8 w-8 text-gray-500" />
              ) : (
                <Wallet className="h-8 w-8 text-gray-500" />
              )}
            </div>
          </div>

          <div className="space-y-2 flex flex-col items-center justify-center">
            <Text
              variant="h4"
              color="muted"
              weight="medium"
              className="mb-2"
              align="center"
            >
              {activeTab === "created"
                ? "No tokens created yet"
                : "No tokens owned yet"}
            </Text>
            <Text
              align="center"
              variant="body"
              color="muted"
              className="max-w-md mx-auto"
            >
              {activeTab === "created"
                ? "Create your first token using the creation form above to see it listed here"
                : "Create or receive some tokens to see them in your collection"}
            </Text>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
