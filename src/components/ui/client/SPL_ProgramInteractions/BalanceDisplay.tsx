"use client";

import React from "react";
import { Text } from "@/components/ui/common";

interface BalanceDisplayProps {
  solBalance: number | null;
  loading: boolean;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  solBalance,
  loading,
}) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
      <Text variant="small" color="muted">
        Current SOL Balance:
      </Text>
      <Text variant="h6" color="primary" weight="semibold" className="ml-2">
        {loading ? (
          <span className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            Loading...
          </span>
        ) : (
          `${solBalance?.toFixed(4) || "0.0000"} SOL`
        )}
      </Text>
    </div>
  );
};
