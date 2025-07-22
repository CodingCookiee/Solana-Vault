"use client";

import React, { useState, useEffect } from "react";
import { useSplTokens } from "@/services/spl-tokens";
import type {
  CreateTokenForm,
  TokenInfo,
  TransactionResult,
  MintInfo,
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

  // State management
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [solBalance, setSolBalance] = useState<number | null>(null);

  // Token creation form
  const [tokenName, setTokenName] = useState<string>("My Token");
  const [symbol, setSymbol] = useState<string>("TKN");
  const [metadata, setMetadata] = useState<string>("https://gist.githubusercontent.com/CodingCookiee/b5aeb8320b9ba6b9ca81d2ede30019fa/raw/f4ff185a9ecb44c5cf329a26924e274729202e7a/metadata.json");
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

  // Load initial data
  useEffect(() => {
    if (solana.connected && solana.isReady) {
      loadSOLBalance();
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
      const balance = await solana.getSOLBalance();
      setSolBalance(balance);
    } catch (error) {
      console.error("Error loading SOL balance:", error);
      setStatus(
        `❌ Error loading SOL balance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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

  const handleResult = (result: TransactionResult, successMessage: string) => {
    if (result.success) {
      setStatus(`✅ ${successMessage}: ${result.signature}`);
      // Refresh data
      setTimeout(() => {
        loadSOLBalance();
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
    loadingMessage: string
  ) => {
    if (!solana.isReady) {
      setStatus("❌ Wallet not ready. Please connect your wallet.");
      return;
    }

    try {
      setLoading(true);
      setStatus(`⏳ ${loadingMessage}...`);
      await operation();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      console.error("Operation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Token operations
  const handleCreateToken = async () => {
    await executeWithLoading(async () => {
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
    }, "Creating token");
  };

  const handleMintTokens = async () => {
    if (!tokenMint) {
      setStatus("❌ Please create a token first");
      return;
    }

    await executeWithLoading(async () => {
      const amountNum = parseFloat(mintAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const result = await solana.mintTokens(tokenMint, amountNum);
      handleResult(result, `Minted ${amountNum} tokens`);
    }, "Minting tokens");
  };

  const handleTransferTokens = async () => {
    if (!tokenMint || !transferRecipient) {
      setStatus("❌ Please provide token mint and recipient address");
      return;
    }

    await executeWithLoading(async () => {
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
    }, "Transferring tokens");
  };

  const handleBurnTokens = async () => {
    if (!tokenMint) {
      setStatus("❌ Please create a token first");
      return;
    }

    await executeWithLoading(async () => {
      const amountNum = parseFloat(burnAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const result = await solana.burnTokens(tokenMint, amountNum);
      handleResult(result, `Burned ${amountNum} tokens`);
    }, "Burning tokens");
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
                <Text variant="h6" color="primary" weight="semibold" className="ml-2">
                  {solBalance.toFixed(4)} SOL
                </Text>
              </div>
            </CardContent>
          )}
        </Card>

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
                />
              </div>
            </div>

            <Button
              onClick={handleCreateToken}
              disabled={loading || !tokenName || !symbol}
              className="w-full py-3 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {loading ? "Creating Token..." : "Create Token"}
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
            <CardContent className="space-y-4">
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
                />
              </div>
              <Button
                onClick={handleMintTokens}
                disabled={loading || !tokenMint}
                className="w-full"
                variant="outline"
              >
                {loading ? "Minting..." : "Mint Tokens"}
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
                />
              </div>
              <Button
                onClick={handleBurnTokens}
                disabled={loading || !tokenMint}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {loading ? "Burning..." : "Burn Tokens"}
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
                />
              </div>
            </div>
            <Button
              onClick={handleTransferTokens}
              disabled={
                loading ||
                !tokenMint ||
                !transferRecipient ||
                !isValidSolanaAddress(transferRecipient)
              }
              className="w-full"
            >
              {loading ? "Transferring..." : "Transfer Tokens"}
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
                    <Text variant="small" weight="medium" className="whitespace-pre-line break-all">
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
