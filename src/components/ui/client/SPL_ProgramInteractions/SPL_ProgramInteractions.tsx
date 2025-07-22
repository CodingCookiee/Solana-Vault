"use client";


import React, { useState, useEffect } from "react";
import { useSplTokens } from "@/services/spl-tokens";
import type { TokenInfo, TransactionResult, MintInfo } from "@/services/spl-tokens";
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

export const ProgramInteractions: React.FC = () => {
  const solana = useSplTokens();

  // State management
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [solBalance, setSolBalance] = useState<number | null>(null);

  // Token operations state
  const [tokenMint, setTokenMint] = useState<string>("");
  const [tokenAccount, setTokenAccount] = useState<string>("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null);

  // Form inputs
  const [mintAmount, setMintAmount] = useState<string>("100");
  const [transferRecipient, setTransferRecipient] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("10");
  const [burnAmount, setBurnAmount] = useState<string>("5");
  const [approveDelegate, setApproveDelegate] = useState<string>("");
  const [approveAmount, setApproveAmount] = useState<string>("50");
  const [decimals, setDecimals] = useState<string>("9");

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
      // Don't show error for token info as account might not exist yet
    }
  };

  const loadMintInfo = async () => {
    if (!tokenMint || !solana.isReady) return;

    try {
      const info = await solana.getMintInfo(tokenMint);
      setMintInfo(info);
    } catch (error) {
      console.error("Error loading mint info:", error);
      // Don't show error for mint info as it might not exist yet
    }
  };

  const handleResult = (result: TransactionResult, successMessage: string) => {
    if (result.success) {
      setStatus(`✅ ${successMessage}: ${result.signature}`);
      // Refresh data
      setTimeout(() => {
        loadSOLBalance();
        loadTokenInfo();
      }, 2000); // Wait a bit for blockchain to update
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
      if (isNaN(decimalsNum) || decimalsNum < 0 || decimalsNum > 9) {
        throw new Error("Decimals must be a number between 0 and 9");
      }

      const result = await solana.createToken(decimalsNum);
      if (result.success) {
        setTokenMint(result.signature);
        handleResult(result, "Token created");
      } else {
        handleResult(result, "");
      }
    }, "Creating token");
  };

  const handleCreateTokenAccount = async () => {
    if (!tokenMint) {
      setStatus("❌ Please create a token first");
      return;
    }

    await executeWithLoading(async () => {
      const result = await solana.createTokenAccount(tokenMint);
      if (result.success) {
        setTokenAccount(result.signature);
        handleResult(result, "Token account created");
      } else {
        handleResult(result, "");
      }
    }, "Creating token account");
  };

  const handleMintTokens = async () => {
    if (!tokenMint) {
      setStatus("❌ Please create a token first");
      return;
    }

    await executeWithLoading(async () => {
      const amount = parseFloat(mintAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const decimalsNum = mintInfo?.decimals || 9;
      const amountInSmallestUnit = Math.floor(
        amount * Math.pow(10, decimalsNum)
      );

      const result = await solana.mintTokens(tokenMint, amountInSmallestUnit);
      handleResult(result, `Minted ${amount} tokens`);
    }, "Minting tokens");
  };

  const handleTransferTokens = async () => {
    if (!tokenMint || !transferRecipient) {
      setStatus("❌ Please provide token mint and recipient address");
      return;
    }

    await executeWithLoading(async () => {
      const amount = parseFloat(transferAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const decimalsNum = mintInfo?.decimals || 9;
      const amountInSmallestUnit = Math.floor(
        amount * Math.pow(10, decimalsNum)
      );

      const result = await solana.transferTokens(
        tokenMint,
        transferRecipient,
        amountInSmallestUnit
      );
      handleResult(result, `Transferred ${amount} tokens`);
    }, "Transferring tokens");
  };

  const handleBurnTokens = async () => {
    if (!tokenMint) {
      setStatus("❌ Please create a token first");
      return;
    }

    await executeWithLoading(async () => {
      const amount = parseFloat(burnAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const decimalsNum = mintInfo?.decimals || 9;
      const amountInSmallestUnit = Math.floor(
        amount * Math.pow(10, decimalsNum)
      );

      const result = await solana.burnTokens(tokenMint, amountInSmallestUnit);
      handleResult(result, `Burned ${amount} tokens`);
    }, "Burning tokens");
  };

  const handleApproveTokens = async () => {
    if (!tokenMint || !approveDelegate) {
      setStatus("❌ Please provide token mint and delegate address");
      return;
    }

    await executeWithLoading(async () => {
      const amount = parseFloat(approveAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const decimalsNum = mintInfo?.decimals || 9;
      const amountInSmallestUnit = Math.floor(
        amount * Math.pow(10, decimalsNum)
      );

      const result = await solana.approveTokens(
        tokenMint,
        approveDelegate,
        amountInSmallestUnit
      );
      handleResult(result, `Approved ${amount} tokens`);
    }, "Approving tokens");
  };

  const handleRevokeApproval = async () => {
    if (!tokenMint) {
      setStatus("❌ Please create a token first");
      return;
    }

    await executeWithLoading(async () => {
      const result = await solana.revokeApproval(tokenMint);
      handleResult(result, "Approval revoked");
    }, "Revoking approval");
  };

  const isValidSolanaAddress = (address: string): boolean => {
    try {
      // Basic validation - Solana addresses are base58 encoded and typically 32-44 characters
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
                SPL Token Program Interactions
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="body" color="muted">
                Create, mint, transfer, burn, and manage SPL tokens on Solana
              </Text>
            </CardDescription>
          </CardHeader>
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
                Create a new SPL token with custom decimals
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
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
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                />
              </div>
              <div className="flex-1 flex items-end">
                <Button
                  onClick={handleCreateToken}
                  disabled={loading}
                  className="w-full"
                >
                  Create Token
                </Button>
              </div>
            </div>

            {tokenMint && (
              <div className="space-y-2">
                <Text variant="small" weight="medium">
                  Token Mint Address:
                </Text>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border font-mono text-xs break-all">
                  {tokenMint}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token Account Creation */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                2. Create Token Account
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="small" color="muted">
                Create an associated token account to hold your tokens
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreateTokenAccount}
              disabled={loading || !tokenMint}
              className="w-full"
            >
              Create Token Account
            </Button>

            {tokenAccount && (
              <div className="space-y-2 mt-4">
                <Text variant="small" weight="medium">
                  Token Account Address:
                </Text>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border font-mono text-xs break-all">
                  {tokenAccount}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token Operations */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Mint Tokens */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="h6" color="default">
                  Mint Tokens
                </Text>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Amount
                  </Text>
                </label>
                <input
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                />
              </div>
              <Button
                onClick={handleMintTokens}
                disabled={loading || !tokenMint}
                className="w-full"
              >
                Mint Tokens
              </Button>
            </CardContent>
          </Card>

          {/* Burn Tokens */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="h6" color="default">
                  Burn Tokens
                </Text>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Amount
                  </Text>
                </label>
                <input
                  type="number"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                />
              </div>
              <Button
                onClick={handleBurnTokens}
                disabled={loading || !tokenMint}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Burn Tokens
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Transfer Tokens */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                Transfer Tokens
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
                  className={`w-full p-2 border rounded-lg dark:bg-gray-800 ${
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
                    Amount
                  </Text>
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
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
              Transfer Tokens
            </Button>
          </CardContent>
        </Card>

        {/* Approve & Revoke */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Approve Tokens */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="h6" color="default">
                  Approve Tokens
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="extraSmall" color="muted">
                  Allow another address to spend your tokens
                </Text>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Delegate Address
                  </Text>
                </label>
                <input
                  type="text"
                  value={approveDelegate}
                  onChange={(e) => setApproveDelegate(e.target.value)}
                  placeholder="Enter delegate address"
                  className={`w-full p-2 border rounded-lg dark:bg-gray-800 ${
                    approveDelegate && !isValidSolanaAddress(approveDelegate)
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : approveDelegate && isValidSolanaAddress(approveDelegate)
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
              </div>
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Amount
                  </Text>
                </label>
                <input
                  type="number"
                  value={approveAmount}
                  onChange={(e) => setApproveAmount(e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                />
              </div>
              <Button
                onClick={handleApproveTokens}
                disabled={
                  loading ||
                  !tokenMint ||
                  !approveDelegate ||
                  !isValidSolanaAddress(approveDelegate)
                }
                variant="outline"
                className="w-full"
              >
                Approve Tokens
              </Button>
            </CardContent>
          </Card>

          {/* Revoke Approval */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="h6" color="default">
                  Revoke Approval
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="extraSmall" color="muted">
                  Remove all token approvals
                </Text>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[140px]">
              <Button
                onClick={handleRevokeApproval}
                disabled={loading || !tokenMint}
                variant="outline"
                className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
              >
                Revoke All Approvals
              </Button>
            </CardContent>
          </Card>
        </div>

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
                      Token Account
                    </Text>
                    <div className="space-y-2">
                      <div>
                        <Text variant="small" color="muted">
                          Balance:
                        </Text>
                        <Text variant="body" weight="semibold" className="ml-2">
                          {tokenInfo.balance.toFixed(tokenInfo.decimals)} tokens
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
                      Mint Information
                    </Text>
                    <div className="space-y-2">
                      <div>
                        <Text variant="small" color="muted">
                          Total Supply:
                        </Text>
                        <Text variant="body" weight="semibold" className="ml-2">
                          {mintInfo.supply.toFixed(mintInfo.decimals)} tokens
                        </Text>
                      </div>
                      <div>
                        <Text variant="small" color="muted">
                          Decimals:
                        </Text>
                        <Text variant="body" weight="semibold" className="ml-2">
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
                    <Text variant="small" weight="medium" className="break-all">
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
