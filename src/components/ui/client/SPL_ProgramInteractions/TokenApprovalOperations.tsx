"use client";

import React, { useState, useEffect } from "react";
import { Button, Text } from "@/components/ui/common";
import { useSplTokens } from "@/services/spl-tokens";
import type { TransactionResult, TokenAllowance } from "@/services/spl-tokens";

interface TokenApprovalOperationsProps {
  tokenMint: string;
  setStatus: (status: string) => void;
  onOperationComplete: () => void;
}

export const TokenApprovalOperations: React.FC<
  TokenApprovalOperationsProps
> = ({ tokenMint, setStatus, onOperationComplete }) => {
  const solana = useSplTokens();

  // Loading states
  const [approveLoading, setApproveLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [transferFromLoading, setTransferFromLoading] = useState(false);
  const [allowanceLoading, setAllowanceLoading] = useState(false);

  // Form states
  const [delegateAddress, setDelegateAddress] = useState<string>("");
  const [approveAmount, setApproveAmount] = useState<string>("100");
  const [ownerAddress, setOwnerAddress] = useState<string>("");
  const [transferFromRecipient, setTransferFromRecipient] =
    useState<string>("");
  const [transferFromAmount, setTransferFromAmount] = useState<string>("10");

  // Allowance info
  const [allowance, setAllowance] = useState<TokenAllowance | null>(null);

  // Load allowance when token mint changes
  useEffect(() => {
    if (tokenMint && solana.isReady) {
      loadAllowance();
    }
  }, [tokenMint, solana.isReady]);

  const loadAllowance = async () => {
    if (!tokenMint || !solana.isReady) return;

    try {
      setAllowanceLoading(true);
      const allowanceInfo = await solana.getTokenAllowance(tokenMint);
      setAllowance(allowanceInfo);
    } catch (error) {
      console.error("Error loading allowance:", error);
    } finally {
      setAllowanceLoading(false);
    }
  };

  const handleResult = (result: TransactionResult, successMessage: string) => {
    if (result.success) {
      setStatus(`✅ ${successMessage}: ${result.signature}`);
      // Refresh data
      setTimeout(() => {
        onOperationComplete();
        loadAllowance();
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

  const handleApproveTokens = async () => {
    if (!tokenMint || !delegateAddress) {
      setStatus("❌ Please provide token mint and delegate address");
      return;
    }

    if (!solana.isReady) {
      setStatus("❌ Wallet not ready. Please connect your wallet.");
      return;
    }

    try {
      setApproveLoading(true);
      setStatus("⏳ Approving tokens...");

      const amountNum = parseFloat(approveAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const result = await solana.approveTokens(
        tokenMint,
        delegateAddress,
        amountNum
      );
      handleResult(
        result,
        `Approved ${amountNum} tokens for ${delegateAddress.slice(0, 8)}...`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      console.error("Operation failed:", error);
    } finally {
      setApproveLoading(false);
    }
  };

  const handleRevokeApproval = async () => {
    if (!tokenMint) {
      setStatus("❌ Please provide token mint address");
      return;
    }

    if (!solana.isReady) {
      setStatus("❌ Wallet not ready. Please connect your wallet.");
      return;
    }

    try {
      setRevokeLoading(true);
      setStatus("⏳ Revoking token approval...");

      const result = await solana.revokeTokenApproval(tokenMint);
      handleResult(result, "Token approval revoked");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      console.error("Operation failed:", error);
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleTransferFrom = async () => {
    if (!tokenMint || !ownerAddress || !transferFromRecipient) {
      setStatus("❌ Please provide all required addresses");
      return;
    }

    if (!solana.isReady) {
      setStatus("❌ Wallet not ready. Please connect your wallet.");
      return;
    }

    try {
      setTransferFromLoading(true);
      setStatus("⏳ Transferring tokens from owner...");

      const amountNum = parseFloat(transferFromAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const result = await solana.transferTokensFrom(
        tokenMint,
        ownerAddress,
        transferFromRecipient,
        amountNum
      );
      handleResult(
        result,
        `Transferred ${amountNum} tokens from ${ownerAddress.slice(
          0,
          8
        )}... to ${transferFromRecipient.slice(0, 8)}...`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      console.error("Operation failed:", error);
    } finally {
      setTransferFromLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Allowance Display */}
      {allowance && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <Text variant="small" weight="medium" className="mb-2">
            Current Token Allowance:
          </Text>
          <div className="space-y-1">
            <Text variant="extraSmall" color="muted">
              Delegate: {allowance.delegate}
            </Text>
            <Text variant="extraSmall" color="muted">
              Approved Amount:{" "}
              <span className="font-semibold">
                {allowance.amount.toLocaleString()}
              </span>{" "}
              tokens
            </Text>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Approve Tokens */}
        <div className="space-y-4">
          <Text variant="h6" weight="semibold">
            Approve Tokens
          </Text>
          <Text variant="small" color="muted">
            Allow another address to spend your tokens
          </Text>

          <div>
            <label className="block mb-2">
              <Text variant="small" weight="medium">
                Delegate Address
              </Text>
            </label>
            <input
              type="text"
              value={delegateAddress}
              onChange={(e) => setDelegateAddress(e.target.value)}
              placeholder="Enter delegate address"
              disabled={approveLoading}
              className={`w-full p-3 border rounded-lg dark:bg-gray-800 ${
                delegateAddress && !isValidSolanaAddress(delegateAddress)
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : delegateAddress && isValidSolanaAddress(delegateAddress)
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {delegateAddress && !isValidSolanaAddress(delegateAddress) && (
              <Text variant="extraSmall" color="error" className="mt-1">
                Invalid Solana address format
              </Text>
            )}
          </div>

          <div>
            <label className="block mb-2">
              <Text variant="small" weight="medium">
                Amount to Approve
              </Text>
            </label>
            <input
              type="number"
              value={approveAmount}
              onChange={(e) => setApproveAmount(e.target.value)}
              min="0"
              step="0.1"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
              placeholder="100"
              disabled={approveLoading}
            />
          </div>

          <Button
            onClick={handleApproveTokens}
            disabled={
              approveLoading ||
              !tokenMint ||
              !delegateAddress ||
              !isValidSolanaAddress(delegateAddress)
            }
            className="w-full"
          >
            {approveLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Approving...
              </span>
            ) : (
              "Approve Tokens"
            )}
          </Button>
        </div>

        {/* Revoke Approval */}
        <div className="space-y-4">
          <Text variant="h6" weight="semibold">
            Revoke Approval
          </Text>
          <Text variant="small" color="muted">
            Remove all token spending permissions
          </Text>

          <div className="py-8 text-center">
            <Text variant="small" color="muted" className="mb-4">
              This will revoke all current token approvals for this token.
            </Text>
            <Button
              onClick={handleRevokeApproval}
              disabled={revokeLoading || !tokenMint || !allowance}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              {revokeLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Revoking...
                </span>
              ) : (
                "Revoke Approval"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Transfer From (Delegate Operation) */}
      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
        <Text variant="h6" weight="semibold">
          Transfer From (Delegate Operation)
        </Text>
        <Text variant="small" color="muted">
          Transfer tokens from an owner who approved you as delegate
        </Text>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2">
              <Text variant="small" weight="medium">
                Owner Address
              </Text>
            </label>
            <input
              type="text"
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
              placeholder="Token owner address"
              disabled={transferFromLoading}
              className={`w-full p-3 border rounded-lg dark:bg-gray-800 ${
                ownerAddress && !isValidSolanaAddress(ownerAddress)
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : ownerAddress && isValidSolanaAddress(ownerAddress)
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
          </div>

          <div>
            <label className="block mb-2">
              <Text variant="small" weight="medium">
                Recipient Address
              </Text>
            </label>
            <input
              type="text"
              value={transferFromRecipient}
              onChange={(e) => setTransferFromRecipient(e.target.value)}
              placeholder="Recipient address"
              disabled={transferFromLoading}
              className={`w-full p-3 border rounded-lg dark:bg-gray-800 ${
                transferFromRecipient &&
                !isValidSolanaAddress(transferFromRecipient)
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : transferFromRecipient &&
                    isValidSolanaAddress(transferFromRecipient)
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
              value={transferFromAmount}
              onChange={(e) => setTransferFromAmount(e.target.value)}
              min="0"
              step="0.1"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
              placeholder="10"
              disabled={transferFromLoading}
            />
          </div>
        </div>

        <Button
          onClick={handleTransferFrom}
          disabled={
            transferFromLoading ||
            !tokenMint ||
            !ownerAddress ||
            !transferFromRecipient ||
            !isValidSolanaAddress(ownerAddress) ||
            !isValidSolanaAddress(transferFromRecipient)
          }
          className="w-full"
          variant="outline"
        >
          {transferFromLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Transferring from owner...
            </span>
          ) : (
            "Transfer From Owner"
          )}
        </Button>
      </div>
    </div>
  );
};
