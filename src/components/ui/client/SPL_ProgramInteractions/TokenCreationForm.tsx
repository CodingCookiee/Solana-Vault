"use client";

import React, { useState } from "react";
import { Button, Text } from "@/components/ui/common";
import { useSplTokens } from "@/services/spl-tokens";
import type { CreateTokenForm, TransactionResult } from "@/services/spl-tokens";

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
    <div className="space-y-4">
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
            disabled={loading}
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
            disabled={loading}
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
          disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>
      </div>

      <Button
        onClick={handleCreateToken}
        disabled={loading || !tokenName || !symbol}
        className="w-full py-3 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Creating Token...
          </span>
        ) : (
          "Create Token"
        )}
      </Button>
    </div>
  );
};
