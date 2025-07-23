"use client";

import React, { useState } from "react";
import { Button, Text } from "@/components/ui/common";
import { useSplTokens } from "@/services/spl-tokens";
import type { TransactionResult } from "@/services/spl-tokens";

interface TokenOperationsProps {
  tokenMint: string;
  setStatus: (status: string) => void;
  onOperationComplete: () => void;
}

export const TokenOperations: React.FC<TokenOperationsProps> = ({
  tokenMint,
  setStatus,
  onOperationComplete,
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
      // Refresh data
      setTimeout(() => {
        onOperationComplete();
      }, 2000);
    } else {
      setStatus(`❌ Error: ${result.error}`);
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
      return;
    }

    if (!solana.isReady) {
      setStatus("❌ Wallet not ready. Please connect your wallet.");
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
      console.error("Operation failed:", error);
    } finally {
      setMintLoading(false);
    }
  };

  const handleTransferTokens = async () => {
    if (!tokenMint || !transferRecipient) {
      setStatus("❌ Please provide token mint and recipient address");
      return;
    }

    if (!solana.isReady) {
      setStatus("❌ Wallet not ready. Please connect your wallet.");
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
      console.error("Operation failed:", error);
    } finally {
      setTransferLoading(false);
    }
  };

  const handleBurnTokens = async () => {
    if (!tokenMint) {
      setStatus("❌ Please create a token first");
      return;
    }

    if (!solana.isReady) {
      setStatus("❌ Wallet not ready. Please connect your wallet.");
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
      console.error("Operation failed:", error);
    } finally {
      setBurnLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Mint Additional Tokens */}
      <div className="space-y-4" id="mint-section">
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
            disabled={mintLoading}
          />
        </div>
        <Button
          onClick={handleMintTokens}
          disabled={mintLoading || !tokenMint}
          className="w-full"
          variant="outline"
        >
          {mintLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Minting...
            </span>
          ) : (
            "Mint Tokens"
          )}
        </Button>
      </div>

      {/* Burn Tokens */}
      <div className="space-y-4">
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
            disabled={burnLoading}
          />
        </div>
        <Button
          onClick={handleBurnTokens}
          disabled={burnLoading || !tokenMint}
          variant="outline"
          className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          {burnLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Burning...
            </span>
          ) : (
            "Burn Tokens"
          )}
        </Button>
      </div>

      {/* Transfer Tokens */}
      <div className="space-y-4 md:col-span-2">
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
              disabled={transferLoading}
              className={`w-full p-3 border rounded-lg dark:bg-gray-800 ${
                transferRecipient && !isValidSolanaAddress(transferRecipient)
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : transferRecipient && isValidSolanaAddress(transferRecipient)
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {transferRecipient && !isValidSolanaAddress(transferRecipient) && (
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
            !isValidSolanaAddress(transferRecipient)
          }
          className="w-full"
        >
          {transferLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Transferring...
            </span>
          ) : (
            "Transfer Tokens"
          )}
        </Button>
      </div>
    </div>
  );
};
