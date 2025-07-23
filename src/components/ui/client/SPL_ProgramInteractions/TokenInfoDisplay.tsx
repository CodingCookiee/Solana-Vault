"use client";

import React from "react";
import { Text } from "@/components/ui/common";
import type { TokenInfo, MintInfo } from "@/services/spl-tokens";

interface TokenInfoDisplayProps {
  tokenInfo: TokenInfo | null;
  mintInfo: MintInfo | null;
}

export const TokenInfoDisplay: React.FC<TokenInfoDisplayProps> = ({
  tokenInfo,
  mintInfo,
}) => {
  if (!tokenInfo && !mintInfo) return null;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Token Account Info */}
      {tokenInfo && (
        <div className="space-y-3">
          <Text variant="h6" color="primary" weight="semibold">
            Your Token Account
          </Text>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Text variant="small" color="muted">
                Balance:
              </Text>
              <Text variant="body" weight="semibold">
                {tokenInfo.balance.toLocaleString()} tokens
              </Text>
            </div>
            <div>
              <Text variant="small" color="muted">
                Account Address:
              </Text>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 font-mono text-xs break-all">
                {tokenInfo.account}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mint Info */}
      {mintInfo && (
        <div className="space-y-3">
          <Text variant="h6" color="primary" weight="semibold">
            Token Mint Information
          </Text>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Text variant="small" color="muted">
                Total Supply:
              </Text>
              <Text variant="body" weight="semibold">
                {mintInfo.supply.toLocaleString()} tokens
              </Text>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Text variant="small" color="muted">
                Decimals:
              </Text>
              <Text variant="body" weight="semibold">
                {mintInfo.decimals}
              </Text>
            </div>
            <div>
              <Text variant="small" color="muted">
                Mint Authority:
              </Text>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 font-mono text-xs break-all">
                {mintInfo.mintAuthority || "None"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
