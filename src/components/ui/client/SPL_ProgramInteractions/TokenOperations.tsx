"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Text,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/common";
import { useSplTokens } from "@/services/spl-tokens";
import type {
  TransactionResult,
  TokenInfo,
  MintInfo,
} from "@/services/spl-tokens";
import {
  Zap,
  Send,
  Flame,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Minus,
  ArrowRightLeft,
} from "lucide-react";
import { toast } from "sonner";

interface TokenOperationsProps {
  tokenMint: string;
  tokenInfo: TokenInfo | null;
  mintInfo: MintInfo | null;
  setStatus: (status: string) => void;
  onOperationComplete: () => void;
  loading: boolean;
}

export const TokenOperations: React.FC<TokenOperationsProps> = ({
  tokenMint,
  tokenInfo,
  mintInfo,
  setStatus,
  onOperationComplete,
  loading,
}) => {
  const solana = useSplTokens();

  // Loading states
  const [mintLoading, setMintLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [burnLoading, setBurnLoading] = useState(false);

  // Operation forms
  const [mintAmount, setMintAmount] = useState<string>("100");
  const [transferRecipient, setTransferRecipient] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("10");
  const [burnAmount, setBurnAmount] = useState<string>("5");

  const handleResult = (result: TransactionResult, successMessage: string) => {
    if (result.success) {
      setStatus(`✅ ${successMessage}: ${result.signature}`);
      toast.success(successMessage);
      // Refresh data
      setTimeout(() => {
        onOperationComplete();
      }, 2000);
    } else {
      setStatus(`❌ Error: ${result.error}`);
      toast.error(`Error: ${result.error}`);
    }
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

  const handleMintTokens = async () => {
    if (!tokenMint) {
      setStatus("❌ Please create a token first");
      toast.error("Please create a token first");
      return;
    }

    if (!solana.isReady) {
      setStatus("❌ Wallet not ready. Please connect your wallet.");
      toast.error("Wallet not ready");
      return;
    }

    try {
      setMintLoading(true);
      setStatus("⏳ Minting tokens...");

      const amountNum = parseFloat(mintAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const result = await solana.mintTokens(tokenMint, amountNum);
      handleResult(result, `Minted ${amountNum} tokens`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      toast.error(`Failed to mint tokens: ${errorMessage}`);
      console.error("Operation failed:", error);
    } finally {
      setMintLoading(false);
    }
  };

  const handleTransferTokens = async () => {
    if (!tokenMint || !transferRecipient) {
      setStatus("❌ Please provide token mint and recipient address");
      toast.error("Please provide all required fields");
      return;
    }

    if (!solana.isReady) {
      setStatus("❌ Wallet not ready. Please connect your wallet.");
      toast.error("Wallet not ready");
      return;
    }

    try {
      setTransferLoading(true);
      setStatus("⏳ Transferring tokens...");

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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      toast.error(`Failed to transfer tokens: ${errorMessage}`);
      console.error("Operation failed:", error);
    } finally {
      setTransferLoading(false);
    }
  };

  const handleBurnTokens = async () => {
    if (!tokenMint) {
      setStatus("❌ Please create a token first");
      toast.error("Please create a token first");
      return;
    }

    if (!solana.isReady) {
      setStatus("❌ Wallet not ready. Please connect your wallet.");
      toast.error("Wallet not ready");
      return;
    }

    try {
      setBurnLoading(true);
      setStatus("⏳ Burning tokens...");

      const amountNum = parseFloat(burnAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const result = await solana.burnTokens(tokenMint, amountNum);
      handleResult(result, `Burned ${amountNum} tokens`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      toast.error(`Failed to burn tokens: ${errorMessage}`);
      console.error("Operation failed:", error);
    } finally {
      setBurnLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Mint and Burn Operations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mint Additional Tokens */}
        <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>

          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>
                  <Text
                    variant="h5"
                    className="text-green-600 dark:text-green-400 font-bold"
                  >
                    Mint Tokens
                  </Text>
                </CardTitle>
                <CardDescription>
                  <Text variant="small" color="muted">
                    Create additional tokens
                  </Text>
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                <Text variant="small" weight="medium">
                  Amount to Mint
                </Text>
              </div>
              <input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                min="0"
                step="0.1"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 transition-colors"
                placeholder="100"
                disabled={mintLoading}
              />
            </div>

            <Button
              onClick={handleMintTokens}
              disabled={
                mintLoading ||
                !tokenMint ||
                !mintAmount ||
                parseFloat(mintAmount) <= 0
              }
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg group border-0"
            >
              {mintLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Minting...</span>
                </div>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Mint Tokens</span>
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>

            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <Text
                  variant="extraSmall"
                  className="text-green-800 dark:text-green-200"
                >
                  Requires mint authority to create new tokens
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Burn Tokens */}
        <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>

          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 shadow-sm">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>
                  <Text
                    variant="h5"
                    className="text-red-600 dark:text-red-400 font-bold"
                  >
                    Burn Tokens
                  </Text>
                </CardTitle>
                <CardDescription>
                  <Text variant="small" color="muted">
                    Permanently destroy tokens
                  </Text>
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Minus className="h-4 w-4 text-red-600 dark:text-red-400" />
                <Text variant="small" weight="medium">
                  Amount to Burn
                </Text>
              </div>
              <input
                type="number"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                min="0"
                step="0.1"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 transition-colors"
                placeholder="5"
                disabled={burnLoading}
              />
            </div>

            <Button
              onClick={handleBurnTokens}
              disabled={
                burnLoading ||
                !tokenMint ||
                !burnAmount ||
                parseFloat(burnAmount) <= 0
              }
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg group border-0"
            >
              {burnLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Burning...</span>
                </div>
              ) : (
                <>
                  <Flame className="h-4 w-4 mr-2" />
                  <span>Burn Tokens</span>
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>

            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <Text
                  variant="extraSmall"
                  className="text-red-800 dark:text-red-200"
                >
                  This action is irreversible and reduces total supply
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transfer Tokens */}
      <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm">
              <ArrowRightLeft className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>
                <Text
                  variant="h5"
                  className="text-blue-600 dark:text-blue-400 font-bold"
                >
                  Transfer Tokens
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="small" color="muted">
                  Send tokens to another wallet
                </Text>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Text variant="small" weight="medium">
                  Recipient Address
                </Text>
              </div>
              <input
                type="text"
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
                placeholder="Enter Solana address..."
                disabled={transferLoading}
                className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 ${
                  transferRecipient && !isValidSolanaAddress(transferRecipient)
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 dark:border-red-700"
                    : transferRecipient &&
                      isValidSolanaAddress(transferRecipient)
                    ? "border-green-300 bg-green-50 dark:bg-green-900/20 focus:ring-green-500 dark:border-green-700"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                } focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800`}
              />

              <AnimatePresence>
                {transferRecipient && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isValidSolanaAddress(transferRecipient) ? (
                      <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <Text
                          variant="extraSmall"
                          className="text-green-800 dark:text-green-200"
                        >
                          Valid recipient address
                        </Text>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                        <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                        <Text
                          variant="extraSmall"
                          className="text-red-800 dark:text-red-200"
                        >
                          Invalid Solana address format
                        </Text>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Text variant="small" weight="medium">
                  Amount to Transfer
                </Text>
              </div>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                min="0"
                step="0.1"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 transition-colors"
                placeholder="10"
                disabled={transferLoading}
              />
            </div>
          </div>

          <Button
            onClick={handleTransferTokens}
            disabled={
              transferLoading ||
              !tokenMint ||
              !transferRecipient ||
              !isValidSolanaAddress(transferRecipient) ||
              !transferAmount ||
              parseFloat(transferAmount) <= 0
            }
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg group border-0"
            size="lg"
          >
            {transferLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Transferring...</span>
              </div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                <span>Transfer Tokens</span>
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          {/* Transfer Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <Text variant="extraSmall" weight="medium">
                Transfer Details
              </Text>
            </div>
            <Text variant="extraSmall" color="muted">
              Network fee: ~0.002 SOL • Creates recipient token account if
              needed • Instant transfer
            </Text>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
