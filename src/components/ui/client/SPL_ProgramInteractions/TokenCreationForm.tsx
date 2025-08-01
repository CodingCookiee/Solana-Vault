"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Text, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/common";
import { useSplTokens } from "@/services/spl-tokens";
import type { CreateTokenForm, TransactionResult } from "@/services/spl-tokens";
import {
  Coins,
  Plus,
  Sparkles,
  Loader2,
  ArrowRight,
  Hash,
  Image,
  Zap,
} from "lucide-react";

interface TokenCreationFormProps {
  onTokenCreated: (mintAddress: string) => void;
  setStatus: (status: string) => void;
}

export const TokenCreationForm: React.FC<TokenCreationFormProps> = ({
  onTokenCreated,
  setStatus,
}) => {
  const solana = useSplTokens();
  const [loading, setLoading] = useState(false);

  // Token creation form
  const [tokenName, setTokenName] = useState<string>("My Token");
  const [symbol, setSymbol] = useState<string>("TKN");
  const [metadata, setMetadata] = useState<string>(
    "https://gist.githubusercontent.com/CodingCookiee/b5aeb8320b9ba6b9ca81d2ede30019fa/raw/89222cee67927eb1dbcd884b92648e0e1d772b7c/metadata.json"
  );
  const [amount, setAmount] = useState<string>("1000");
  const [decimals, setDecimals] = useState<string>("9");

  const handleCreateToken = async () => {
    if (!solana.isReady) {
      setStatus("❌ Wallet not ready. Please connect your wallet.");
      return;
    }

    try {
      setLoading(true);
      setStatus("⏳ Creating token...");

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
        onTokenCreated(result.signature);
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      console.error("Operation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResult = (result: TransactionResult, successMessage: string) => {
    if (result.success) {
      setStatus(`✅ ${successMessage}: ${result.signature}`);
    } else {
      setStatus(`❌ Error: ${result.error}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
        
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>
                <Text variant="h5" className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                  Create SPL Token
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="small" color="muted">
                  Deploy a new SPL token to the Solana blockchain
                </Text>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Token Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <label className="block">
                  <Text variant="small" weight="medium">
                    Token Name
                  </Text>
                </label>
              </div>
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 transition-colors"
                placeholder="My Token"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <label className="block">
                  <Text variant="small" weight="medium">
                    Symbol
                  </Text>
                </label>
              </div>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 transition-colors"
                placeholder="TKN"
                disabled={loading}
              />
            </div>
          </div>

          {/* Metadata URL */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Image className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <label className="block">
                <Text variant="small" weight="medium">
                  Metadata URL
                </Text>
              </label>
            </div>
            <input
              type="text"
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 transition-colors"
              placeholder="https://example.com/metadata.json"
              disabled={loading}
            />
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Text variant="extraSmall" className="text-purple-800 dark:text-purple-200">
                💡 JSON file containing token metadata (name, symbol, image, description)
              </Text>
            </div>
          </div>

          {/* Token Configuration */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Coins className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <label className="block">
                  <Text variant="small" weight="medium">
                    Initial Amount
                  </Text>
                </label>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 transition-colors"
                placeholder="1000"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <label className="block">
                  <Text variant="small" weight="medium">
                    Decimals
                  </Text>
                </label>
              </div>
              <input
                type="number"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                min="0"
                max="9"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 transition-colors"
                placeholder="9"
                disabled={loading}
              />
            </div>
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreateToken}
            disabled={loading || !tokenName || !symbol}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg group border-0"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Token...</span>
              </div>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                <span>Create Token</span>
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          {/* Transaction Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <Text variant="extraSmall" weight="medium">Transaction Details</Text>
            </div>
            <Text variant="extraSmall" color="muted">
              Network fee: ~0.01 SOL • Creates mint account and metadata • You will be the mint authority
            </Text>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};