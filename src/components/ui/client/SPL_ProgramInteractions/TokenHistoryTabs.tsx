"use client";

import React from "react";
import { Text } from "@/components/ui/common";
import { Crown, Wallet, Shield } from "lucide-react";
import type { CreatedToken } from "@/services/spl-tokens";

interface TokenHistoryTabsProps {
  activeTab: "created" | "owned";
  onTabChange: (tab: "created" | "owned") => void;
  createdTokens: CreatedToken[];
  ownedTokens: CreatedToken[];
}

export const TokenHistoryTabs: React.FC<TokenHistoryTabsProps> = ({
  activeTab,
  onTabChange,
  createdTokens,
  ownedTokens,
}) => {
  return (
    <>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => onTabChange("created")}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === "created"
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
          onClick={() => onTabChange("owned")}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === "owned"
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
          {activeTab === "created"
            ? "Tokens where you are the mint authority and can create additional supply"
            : "Tokens you currently hold in your wallet"}
        </Text>
        {activeTab === "created" && (
          <Text
            variant="extraSmall"
            color="muted"
            className="mt-1 flex items-center space-x-1"
          >
            <Shield className="h-3 w-3" />
            <span>
              Created tokens are stored locally and may be lost if browser data
              is cleared
            </span>
          </Text>
        )}
      </div>
    </>
  );
};
