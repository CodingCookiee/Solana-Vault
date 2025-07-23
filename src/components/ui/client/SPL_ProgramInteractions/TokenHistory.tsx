"use client";

import React, { useState } from "react";
import { Button, Text } from "@/components/ui/common";
import { useSplTokens } from "@/services/spl-tokens";
import type { CreatedToken, TransactionResult } from "@/services/spl-tokens";

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
  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Token Header */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {token.symbol?.charAt(0) || "T"}
            </div>
            <div>
              <Text variant="h6" weight="semibold">
                {token.name || "Unknown Token"}
              </Text>
              <div className="flex items-center space-x-2">
                <Text variant="small" color="muted">
                  {token.symbol || "N/A"} • {token.decimals} decimals
                </Text>
                {activeHistoryTab === "created" &&
                  token.mintAuthority === publicKey && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Mint Authority
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Token Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <Text
                variant="extraSmall"
                color="muted"
                className="uppercase tracking-wide"
              >
                Total Supply
              </Text>
              <Text variant="small" weight="semibold" className="mt-1">
                {token.totalSupply.toLocaleString()} {token.symbol}
              </Text>
            </div>
            {token.userBalance !== undefined && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <Text
                  variant="extraSmall"
                  color="muted"
                  className="uppercase tracking-wide"
                >
                  Your Balance
                </Text>
                <Text variant="small" weight="semibold" className="mt-1">
                  {token.userBalance.toLocaleString()} {token.symbol}
                </Text>
              </div>
            )}
          </div>

          {/* Mint Address */}
          <div className="mb-3">
            <Text
              variant="extraSmall"
              color="muted"
              className="uppercase tracking-wide mb-1"
            >
              Mint Address
            </Text>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg border">
              <Text variant="extraSmall" className="font-mono break-all">
                {token.mintAddress}
              </Text>
            </div>
          </div>

          {/* Metadata URI */}
          {token.metadata?.uri && (
            <div className="mb-3">
              <Text
                variant="extraSmall"
                color="muted"
                className="uppercase tracking-wide mb-1"
              >
                Metadata URI
              </Text>
              <a
                href={token.metadata.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-xs break-all inline-flex items-center space-x-1"
              >
                <span>{token.metadata.uri}</span>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}

          {/* Creation Date */}
          {token.createdAt && (
            <div className="mb-3">
              <Text
                variant="extraSmall"
                color="muted"
                className="uppercase tracking-wide"
              >
                Created: {new Date(token.createdAt).toLocaleDateString()}
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Balance Warning */}
      {token.userBalance && token.userBalance > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <Text
              variant="extraSmall"
              className="text-yellow-700 dark:text-yellow-300"
            >
              <strong>
                Balance: {token.userBalance.toLocaleString()} {token.symbol}
              </strong>
              <br />
              Transfer or burn tokens before closing account.
            </Text>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onSelect(token.mintAddress)}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>Use for Operations</span>
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
          className="flex items-center space-x-1"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span>Explorer</span>
        </Button>

        <Button
          onClick={() => {
            navigator.clipboard.writeText(token.mintAddress);
            setStatus("✅ Token address copied to clipboard");
            setTimeout(() => {
              setStatus("");
            }, 3000);
          }}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>Copy</span>
        </Button>

        {activeHistoryTab === "created" &&
          token.mintAuthority === publicKey && (
            <Button
              onClick={() => {
                onSelect(token.mintAddress);
                // Scroll to mint section
                document
                  .getElementById("mint-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              variant="outline"
              size="sm"
              className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20 flex items-center space-x-1"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Mint More</span>
            </Button>
          )}

        {/* Delete/Close Token Account Button */}
        <Button
          onClick={() =>
            onClose(token.mintAddress, token.name || "Unknown Token")
          }
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20 flex items-center space-x-1"
          disabled={closeLoading}
        >
          {closeLoading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
          ) : (
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
          <span>
            {activeHistoryTab === "created" ? "Remove" : "Close Account"}
          </span>
        </Button>
      </div>
    </div>
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

  const handleCloseTokenAccount = async (
    mintAddress: string,
    tokenName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to close the token account for ${tokenName}? This will remove the token from your wallet. Make sure you have 0 balance first.`
      )
    ) {
      return;
    }

    try {
      setCloseLoading(true);
      setStatus("⏳ Closing token account...");

      const result = await solana.closeTokenAccount(mintAddress);
      if (result.success) {
        // Also remove from local storage if it's a created token
        solana.removeCreatedTokenFromStorage(mintAddress);
        setStatus(`✅ Token account closed successfully: ${result.signature}`);
        // Refresh token history
        setTimeout(() => {
          onRefresh();
        }, 2000);
      } else {
        handleResult(result, "");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      console.error("Operation failed:", error);
    } finally {
      setCloseLoading(false);
    }
  };

  const handleResult = (result: TransactionResult, successMessage: string) => {
    if (result.success) {
      setStatus(`✅ ${successMessage}: ${result.signature}`);
    } else {
      setStatus(`❌ Error: ${result.error}`);
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
    setStatus("✅ Token data exported successfully");
    setTimeout(() => {
      setStatus("");
    }, 3000);
  };

  const handleClearCreatedTokens = () => {
    if (
      confirm(
        "Are you sure you want to clear all created tokens from local storage? This will not affect the actual tokens on the blockchain."
      )
    ) {
      localStorage.removeItem("created-tokens");
      onRefresh(); // This will update the state in the parent component
      setStatus("✅ Created tokens list cleared");
      setTimeout(() => {
        setStatus("");
      }, 3000);
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveHistoryTab("created")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeHistoryTab === "created"
              ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Created Tokens ({createdTokens.length})
        </button>
        <button
          onClick={() => setActiveHistoryTab("owned")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeHistoryTab === "owned"
              ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Owned Tokens ({ownedTokens.length})
        </button>
      </div>

      {/* Tab Info and Refresh Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <Text variant="small" color="muted">
            {activeHistoryTab === "created"
              ? "Tokens where you are the mint authority"
              : "Tokens you currently hold"}
          </Text>
          {activeHistoryTab === "created" && (
            <Text variant="extraSmall" color="muted" className="mt-1">
              Note: Created tokens are stored locally. Clear browser data will
              remove this list.
            </Text>
          )}
        </div>
        <Button
          onClick={onRefresh}
          disabled={loadingHistory}
          variant="outline"
          size="sm"
        >
          {loadingHistory ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
              Loading...
            </span>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {/* Token List */}
      <div className="space-y-3">
        {loadingHistory ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <Text variant="small" color="muted">
              Loading token history...
            </Text>
          </div>
        ) : (
          <>
            {(activeHistoryTab === "created" ? createdTokens : ownedTokens)
              .length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="mb-4">
                  {activeHistoryTab === "created" ? (
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-8 h-8 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-8 h-8 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <Text variant="body" color="muted" weight="medium">
                  {activeHistoryTab === "created"
                    ? "No tokens created yet"
                    : "No tokens owned yet"}
                </Text>
                <Text variant="small" color="muted" className="mt-2">
                  {activeHistoryTab === "created"
                    ? "Create your first token using the form above!"
                    : "Create or receive some tokens to see them here!"}
                </Text>
              </div>
            ) : (
              <div className="grid gap-4">
                {(activeHistoryTab === "created"
                  ? createdTokens
                  : ownedTokens
                ).map((token, index) => (
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
              </div>
            )}
          </>
        )}
      </div>

      {/* Token History Stats */}
      {!loadingHistory &&
        (createdTokens.length > 0 || ownedTokens.length > 0) && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Text
                  variant="h6"
                  weight="bold"
                  className="text-purple-600 dark:text-purple-400"
                >
                  {createdTokens.length}
                </Text>
                <Text variant="small" color="muted">
                  Tokens Created
                </Text>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Text
                  variant="h6"
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
          </div>
        )}

      {/* Quick Actions for Token History */}
      {!loadingHistory &&
        (createdTokens.length > 0 || ownedTokens.length > 0) && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Text variant="small" weight="medium" className="mb-3">
              Quick Actions:
            </Text>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  const tokens =
                    activeHistoryTab === "created"
                      ? createdTokens
                      : ownedTokens;
                  const addresses = tokens.map((t) => t.mintAddress).join("\n");
                  navigator.clipboard.writeText(addresses);
                  setStatus("✅ All token addresses copied to clipboard");
                  setTimeout(() => {
                    setStatus("");
                  }, 3000);
                }}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy All Addresses</span>
              </Button>

              {activeHistoryTab === "created" && createdTokens.length > 0 && (
                <Button
                  onClick={handleClearCreatedTokens}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-900/20 flex items-center space-x-1"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                    />
                  </svg>
                  <span>Clear List</span>
                </Button>
              )}

              <Button
                onClick={handleExportTokens}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Export Data</span>
              </Button>
            </div>
          </div>
        )}
    </div>
  );
};
