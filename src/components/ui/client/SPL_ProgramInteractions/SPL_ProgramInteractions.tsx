"use client";

import React, { useState, useEffect } from "react";
import { useSplTokens } from "@/services/spl-tokens";
import type {
  CreateTokenForm,
  TokenInfo,
  TransactionResult,
  MintInfo,
  CreatedToken,
} from "@/services/spl-tokens";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Button,
  Text,
} from "@/components/ui/common";

export const SPLProgramInteractions: React.FC = () => {
  const solana = useSplTokens();

  // Separate loading states for each operation
  const [loadingStates, setLoadingStates] = useState({
    create: false,
    mint: false,
    transfer: false,
    burn: false,
    closeAccount: false,
    general: false, // for other operations like loading balance, token info
  });

  const [status, setStatus] = useState<string>("");
  const [solBalance, setSolBalance] = useState<number | null>(null);

  // Token creation form
  const [tokenName, setTokenName] = useState<string>("My Token");
  const [symbol, setSymbol] = useState<string>("TKN");
  const [metadata, setMetadata] = useState<string>(
    "https://gist.githubusercontent.com/CodingCookiee/b5aeb8320b9ba6b9ca81d2ede30019fa/raw/f4ff185a9ecb44c5cf329a26924e274729202e7a/metadata.json"
  );
  const [amount, setAmount] = useState<string>("1000");
  const [decimals, setDecimals] = useState<string>("9");

  // Token operations
  const [tokenMint, setTokenMint] = useState<string>("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null);

  // Operation forms
  const [mintAmount, setMintAmount] = useState<string>("100");
  const [transferRecipient, setTransferRecipient] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("10");
  const [burnAmount, setBurnAmount] = useState<string>("5");

  // Token history state
  const [createdTokens, setCreatedTokens] = useState<CreatedToken[]>([]);
  const [ownedTokens, setOwnedTokens] = useState<CreatedToken[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<"created" | "owned">(
    "created"
  );

  // Helper function to update specific loading state
  const setLoadingState = (
    operation: keyof typeof loadingStates,
    loading: boolean
  ) => {
    setLoadingStates((prev) => ({
      ...prev,
      [operation]: loading,
    }));
  };

  // Check if any operation is loading
  const isAnyLoading = Object.values(loadingStates).some((loading) => loading);

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
      setLoadingState("general", true);
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
      setLoadingState("general", false);
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

  const handleResult = (result: TransactionResult, successMessage: string) => {
    if (result.success) {
      setStatus(`✅ ${successMessage}: ${result.signature}`);
      // Refresh data
      setTimeout(() => {
        loadSOLBalance();
        loadTokenHistory(); // Refresh token history
        if (tokenMint) {
          loadTokenInfo();
          loadMintInfo();
        }
      }, 2000);
    } else {
      setStatus(`❌ Error: ${result.error}`);
    }
  };

  const executeWithLoading = async (
    operation: () => Promise<void>,
    loadingMessage: string,
    operationType: keyof typeof loadingStates
  ) => {
    if (!solana.isReady) {
      setStatus("❌ Wallet not ready. Please connect your wallet.");
      return;
    }

    try {
      setLoadingState(operationType, true);
      setStatus(`⏳ ${loadingMessage}...`);
      await operation();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      console.error("Operation failed:", error);
    } finally {
      setLoadingState(operationType, false);
    }
  };

  // Token operations with specific loading states
  const handleCreateToken = async () => {
    await executeWithLoading(
      async () => {
        const decimalsNum = parseInt(decimals);
        const amountNum = parseInt(amount);

        if (isNaN(decimalsNum) || decimalsNum < 0 || decimalsNum > 9) {
          throw new Error("Decimals must be a number between 0 and 9");
        }

        if (isNaN(amountNum) || amountNum <= 0) {
          throw new Error("Amount must be a positive number");
        }

        if (!tokenName || !symbol) {
          throw new Error("Token name and symbol are required");
        }

        const form: CreateTokenForm = {
          tokenName,
          symbol,
          metadata,
          amount: amountNum,
          decimals: decimalsNum,
        };

        const result = await solana.createToken(form);

        if (result.success) {
          setTokenMint(result.signature);
          setStatus(`✅ Token created successfully!

Mint Address: ${result.signature}

To add your token to Phantom wallet:
1. Open Phantom and click "Tokens"
2. Click the "+" button
3. Paste your token mint address: ${result.signature}
4. Click "Add"

View on Solana Explorer:
https://explorer.solana.com/address/${result.signature}?cluster=devnet`);
        } else {
          handleResult(result, "");
        }
      },
      "Creating token",
      "create"
    );
  };

  const handleMintTokens = async () => {
    if (!tokenMint) {
      setStatus("❌ Please create a token first");
      return;
    }

    await executeWithLoading(
      async () => {
        const amountNum = parseFloat(mintAmount);
        if (isNaN(amountNum) || amountNum <= 0) {
          throw new Error("Amount must be a positive number");
        }

        const result = await solana.mintTokens(tokenMint, amountNum);
        handleResult(result, `Minted ${amountNum} tokens`);
      },
      "Minting tokens",
      "mint"
    );
  };

  const handleTransferTokens = async () => {
    if (!tokenMint || !transferRecipient) {
      setStatus("❌ Please provide token mint and recipient address");
      return;
    }

    await executeWithLoading(
      async () => {
        const amountNum = parseFloat(transferAmount);
        if (isNaN(amountNum) || amountNum <= 0) {
          throw new Error("Amount must be a positive number");
        }

        const result = await solana.transferTokens(
          tokenMint,
          transferRecipient,
          amountNum
        );
        handleResult(result, `Transferred ${amountNum} tokens`);
      },
      "Transferring tokens",
      "transfer"
    );
  };

  const handleBurnTokens = async () => {
    if (!tokenMint) {
      setStatus("❌ Please create a token first");
      return;
    }

    await executeWithLoading(
      async () => {
        const amountNum = parseFloat(burnAmount);
        if (isNaN(amountNum) || amountNum <= 0) {
          throw new Error("Amount must be a positive number");
        }

        const result = await solana.burnTokens(tokenMint, amountNum);
        handleResult(result, `Burned ${amountNum} tokens`);
      },
      "Burning tokens",
      "burn"
    );
  };

  const isValidSolanaAddress = (address: string): boolean => {
    try {
      return (
        address.length >= 32 &&
        address.length <= 44 &&
        /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)
      );
    } catch {
      return false;
    }
  };

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

    await executeWithLoading(
      async () => {
        const result = await solana.closeTokenAccount(mintAddress);
        if (result.success) {
          // Also remove from local storage if it's a created token
          solana.removeCreatedTokenFromStorage(mintAddress);
          setStatus(
            `✅ Token account closed successfully: ${result.signature}`
          );
          // Refresh token history
          setTimeout(() => {
            loadTokenHistory();
          }, 2000);
        } else {
          handleResult(result, "");
        }
      },
      "Closing token account",
      "closeAccount"
    );
  };

  // Show loading state if wallet is not ready
  if (!solana.connected) {
    return (
      <AuthGate>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <Text variant="h5" color="muted">
              Please connect your wallet to use SPL Token features
            </Text>
          </CardContent>
        </Card>
      </AuthGate>
    );
  }

  if (!solana.isReady) {
    return (
      <AuthGate>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <Text variant="h5" color="muted">
              Initializing wallet connection...
            </Text>
          </CardContent>
        </Card>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h3" color="primary">
                SPL Token Creator
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="body" color="muted">
                Create, mint, transfer, and burn SPL tokens on Solana
              </Text>
            </CardDescription>
          </CardHeader>
          {solBalance !== null && (
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <Text variant="small" color="muted">
                  Current SOL Balance:
                </Text>
                <Text
                  variant="h6"
                  color="primary"
                  weight="semibold"
                  className="ml-2"
                >
                  {loadingStates.general ? (
                    <span className="inline-flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      Loading...
                    </span>
                  ) : (
                    `${solBalance.toFixed(4)} SOL`
                  )}
                </Text>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Token History Section - Include the complete section from previous response */}
        {/* ... Token History Section ... */}

        {/* Token Creation */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                1. Create Token
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="small" color="muted">
                Create a new SPL token with metadata
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Token Name
                  </Text>
                </label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 text-lg"
                  placeholder="My Token"
                  disabled={loadingStates.create}
                />
              </div>
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Symbol
                  </Text>
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 text-lg"
                  placeholder="TKN"
                  disabled={loadingStates.create}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">
                <Text variant="small" weight="medium">
                  Metadata URL
                </Text>
              </label>
              <input
                type="text"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 text-lg"
                placeholder="https://example.com/metadata.json"
                disabled={loadingStates.create}
              />
              <Text variant="extraSmall" color="muted" className="mt-1">
                JSON file with token metadata (name, symbol, image, description)
              </Text>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Initial Amount
                  </Text>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 text-lg"
                  placeholder="1000"
                  disabled={loadingStates.create}
                />
              </div>
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Decimals
                  </Text>
                </label>
                <input
                  type="number"
                  value={decimals}
                  onChange={(e) => setDecimals(e.target.value)}
                  min="0"
                  max="9"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 text-lg"
                  placeholder="9"
                  disabled={loadingStates.create}
                />
              </div>
            </div>

            <Button
              onClick={handleCreateToken}
              disabled={loadingStates.create || !tokenName || !symbol}
              className="w-full py-3 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {loadingStates.create ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Token...
                </span>
              ) : (
                "Create Token"
              )}
            </Button>

            {tokenMint && (
              <div className="space-y-2 mt-4">
                <Text variant="small" weight="medium">
                  Token Mint Address:
                </Text>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border font-mono text-sm break-all">
                  {tokenMint}
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() =>
                      window.open(
                        `https://explorer.solana.com/address/${tokenMint}?cluster=devnet`,
                        "_blank"
                      )
                    }
                    variant="outline"
                    size="sm"
                  >
                    View in Explorer
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(tokenMint);
                      setStatus("✅ Token address copied to clipboard");
                      setTimeout(() => {
                        if (status.includes("Token address copied")) {
                          setStatus("");
                        }
                      }, 3000);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Copy Address
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token Operations */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Mint Additional Tokens */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="h6" color="default">
                  2. Mint Additional Tokens
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="small" color="muted">
                  Mint more tokens to your wallet
                </Text>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4" id="mint-section">
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Amount to Mint
                  </Text>
                </label>
                <input
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                  placeholder="100"
                  disabled={loadingStates.mint}
                />
              </div>
              <Button
                onClick={handleMintTokens}
                disabled={loadingStates.mint || !tokenMint}
                className="w-full"
                variant="outline"
              >
                {loadingStates.mint ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Minting...
                  </span>
                ) : (
                  "Mint Tokens"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Burn Tokens */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="h6" color="default">
                  3. Burn Tokens
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="small" color="muted">
                  Permanently destroy tokens
                </Text>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Amount to Burn
                  </Text>
                </label>
                <input
                  type="number"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                  placeholder="5"
                  disabled={loadingStates.burn}
                />
              </div>
              <Button
                onClick={handleBurnTokens}
                disabled={loadingStates.burn || !tokenMint}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {loadingStates.burn ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Burning...
                  </span>
                ) : (
                  "Burn Tokens"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Transfer Tokens */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                4. Transfer Tokens
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="small" color="muted">
                Send tokens to another Solana address
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Recipient Address
                  </Text>
                </label>
                <input
                  type="text"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="Enter Solana address"
                  disabled={loadingStates.transfer}
                  className={`w-full p-3 border rounded-lg dark:bg-gray-800 ${
                    transferRecipient &&
                    !isValidSolanaAddress(transferRecipient)
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : transferRecipient &&
                        isValidSolanaAddress(transferRecipient)
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {transferRecipient &&
                  !isValidSolanaAddress(transferRecipient) && (
                    <Text variant="extraSmall" color="error" className="mt-1">
                      Invalid Solana address format
                    </Text>
                  )}
              </div>
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Amount to Transfer
                  </Text>
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                  placeholder="10"
                  disabled={loadingStates.transfer}
                />
              </div>
            </div>
            <Button
              onClick={handleTransferTokens}
              disabled={
                loadingStates.transfer ||
                !tokenMint ||
                !transferRecipient ||
                !isValidSolanaAddress(transferRecipient)
              }
              className="w-full"
            >
              {loadingStates.transfer ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Transferring...
                </span>
              ) : (
                "Transfer Tokens"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Token Information */}
        {(tokenInfo || mintInfo) && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="h5" color="default">
                  Token Information
                </Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        {/* Token History Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                Token History
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="small" color="muted">
                View tokens you've created and tokens you own
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    Note: Created tokens are stored locally. Clear browser data
                    will remove this list.
                  </Text>
                )}
              </div>
              <Button
                onClick={loadTokenHistory}
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
                  {(activeHistoryTab === "created"
                    ? createdTokens
                    : ownedTokens
                  ).length === 0 ? (
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
                        <div
                          key={token.mintAddress}
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
                                      {token.symbol || "N/A"} • {token.decimals}{" "}
                                      decimals
                                    </Text>
                                    {activeHistoryTab === "created" &&
                                      token.mintAuthority ===
                                        solana.publicKey?.toBase58() && (
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
                                  <Text
                                    variant="small"
                                    weight="semibold"
                                    className="mt-1"
                                  >
                                    {token.totalSupply.toLocaleString()}{" "}
                                    {token.symbol}
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
                                    <Text
                                      variant="small"
                                      weight="semibold"
                                      className="mt-1"
                                    >
                                      {token.userBalance.toLocaleString()}{" "}
                                      {token.symbol}
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
                                  <Text
                                    variant="extraSmall"
                                    className="font-mono break-all"
                                  >
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
                                    Created:{" "}
                                    {new Date(
                                      token.createdAt
                                    ).toLocaleDateString()}
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
                                    Balance:{" "}
                                    {token.userBalance.toLocaleString()}{" "}
                                    {token.symbol}
                                  </strong>
                                  <br />
                                  Transfer or burn tokens before closing
                                  account.
                                </Text>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => setTokenMint(token.mintAddress)}
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-1"
                              disabled={isAnyLoading}
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
                                navigator.clipboard.writeText(
                                  token.mintAddress
                                );
                                setStatus(
                                  "✅ Token address copied to clipboard"
                                );
                                setTimeout(() => {
                                  if (status.includes("Token address copied")) {
                                    setStatus("");
                                  }
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
                              token.mintAuthority ===
                                solana.publicKey?.toBase58() && (
                                <Button
                                  onClick={() => {
                                    setTokenMint(token.mintAddress);
                                    // Scroll to mint section
                                    document
                                      .getElementById("mint-section")
                                      ?.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20 flex items-center space-x-1"
                                  disabled={isAnyLoading}
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
                                handleCloseTokenAccount(
                                  token.mintAddress,
                                  token.name || "Unknown Token"
                                )
                              }
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20 flex items-center space-x-1"
                              disabled={loadingStates.closeAccount}
                            >
                              {loadingStates.closeAccount ? (
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
                                {activeHistoryTab === "created"
                                  ? "Remove"
                                  : "Close Account"}
                              </span>
                            </Button>
                          </div>
                        </div>
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
                        const addresses = tokens
                          .map((t) => t.mintAddress)
                          .join("\n");
                        navigator.clipboard.writeText(addresses);
                        setStatus("✅ All token addresses copied to clipboard");
                        setTimeout(() => {
                          if (status.includes("All token addresses copied")) {
                            setStatus("");
                          }
                        }, 3000);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                      disabled={isAnyLoading}
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

                    {activeHistoryTab === "created" &&
                      createdTokens.length > 0 && (
                        <Button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to clear all created tokens from local storage? This will not affect the actual tokens on the blockchain."
                              )
                            ) {
                              localStorage.removeItem("created-tokens");
                              setCreatedTokens([]);
                              setStatus("✅ Created tokens list cleared");
                              setTimeout(() => {
                                if (
                                  status.includes("Created tokens list cleared")
                                ) {
                                  setStatus("");
                                }
                              }, 3000);
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-900/20 flex items-center space-x-1"
                          disabled={isAnyLoading}
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
                      onClick={() => {
                        const exportData = {
                          createdTokens,
                          ownedTokens,
                          exportedAt: new Date().toISOString(),
                          wallet: solana.publicKey?.toBase58(),
                        };
                        const dataStr = JSON.stringify(exportData, null, 2);
                        const dataBlob = new Blob([dataStr], {
                          type: "application/json",
                        });
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
                          if (status.includes("Token data exported")) {
                            setStatus("");
                          }
                        }, 3000);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                      disabled={isAnyLoading}
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
          </CardContent>
        </Card>

        {/* Status Display */}
        {status && (
          <Card>
            <CardContent>
              <div
                className={`p-4 rounded-lg border ${
                  status.includes("❌")
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : status.includes("✅")
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <Text
                      variant="small"
                      weight="medium"
                      className="whitespace-pre-line break-all"
                    >
                      {status}
                    </Text>
                  </div>
                  {status.includes("✅") && (
                    <Button
                      onClick={() => setStatus("")}
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      
      </div>
    </AuthGate>
  );
};
