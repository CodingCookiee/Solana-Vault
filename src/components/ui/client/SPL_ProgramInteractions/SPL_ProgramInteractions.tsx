"use client";

import React, { useState, useEffect } from "react";
import { useSplTokens } from "@/services/spl-tokens";
import type { TokenInfo, MintInfo, CreatedToken } from "@/services/spl-tokens";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Text,
} from "@/components/ui/common";

import { TokenCreationForm } from "./TokenCreationForm";
import { TokenOperations } from "./TokenOperations";
import { TokenApprovalOperations } from "./TokenApprovalOperations";
import { TokenInfoDisplay } from "./TokenInfoDisplay";
import { TokenHistory } from "./TokenHistory";
import { StatusDisplay } from "./StatusDisplay";
import { BalanceDisplay } from "./BalanceDisplay";

export const SPLProgramInteractions: React.FC = () => {
  const solana = useSplTokens();
  const [status, setStatus] = useState<string>("");
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Token operations
  const [tokenMint, setTokenMint] = useState<string>("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null);

  // Token history state
  const [createdTokens, setCreatedTokens] = useState<CreatedToken[]>([]);
  const [ownedTokens, setOwnedTokens] = useState<CreatedToken[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
      setLoadingBalance(true);
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
      setLoadingBalance(false);
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

  const refreshData = () => {
    loadSOLBalance();
    loadTokenHistory();
    if (tokenMint) {
      loadTokenInfo();
      loadMintInfo();
    }
  };

  const handleTokenCreated = (mintAddress: string) => {
    setTokenMint(mintAddress);
    // Refresh data after token creation
    setTimeout(refreshData, 2000);
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
                Create, mint, transfer, burn, approve, and revoke SPL tokens on
                Solana
              </Text>
            </CardDescription>
          </CardHeader>
          {solBalance !== null && (
            <CardContent>
              <BalanceDisplay
                solBalance={solBalance}
                loading={loadingBalance}
              />
            </CardContent>
          )}
        </Card>

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
            <TokenHistory
              createdTokens={createdTokens}
              ownedTokens={ownedTokens}
              onSelectToken={setTokenMint}
              onRefresh={loadTokenHistory}
              setStatus={setStatus}
              loadingHistory={loadingHistory}
            />
          </CardContent>
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
          <CardContent>
            <TokenCreationForm
              onTokenCreated={handleTokenCreated}
              setStatus={setStatus}
            />

            {tokenMint && (
              <div className="space-y-2 mt-4">
                <Text variant="small" weight="medium">
                  Token Mint Address:
                </Text>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border font-mono text-sm break-all">
                  {tokenMint}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      window.open(
                        `https://explorer.solana.com/address/${tokenMint}?cluster=devnet`,
                        "_blank"
                      )
                    }
                    className="px-3 py-1 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    View in Explorer
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tokenMint);
                      setStatus("✅ Token address copied to clipboard");
                      setTimeout(() => {
                        if (status.includes("Token address copied")) {
                          setStatus("");
                        }
                      }, 3000);
                    }}
                    className="px-3 py-1 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Copy Address
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token Operations */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                2. Basic Token Operations
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="small" color="muted">
                Mint, burn, and transfer your tokens
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TokenOperations
              tokenMint={tokenMint}
              setStatus={setStatus}
              onOperationComplete={refreshData}
            />
          </CardContent>
        </Card>

        {/* Token Approval Operations */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                3. Token Approval Operations
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="small" color="muted">
                Approve spending permissions and delegate transfers
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TokenApprovalOperations
              tokenMint={tokenMint}
              setStatus={setStatus}
              onOperationComplete={refreshData}
            />
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
              <TokenInfoDisplay tokenInfo={tokenInfo} mintInfo={mintInfo} />
            </CardContent>
          </Card>
        )}

        {/* Status Display */}
        {status && (
          <StatusDisplay status={status} onClear={() => setStatus("")} />
        )}
      </div>
    </AuthGate>
  );
};
