"use client";

import React, { useState, useEffect } from "react";
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
  TokenAllowance,
  TokenInfo,
  MintInfo,
} from "@/services/spl-tokens";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  ArrowRightLeft,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Users,
  Key,
  Send,
} from "lucide-react";

interface TokenApprovalOperationsProps {
  tokenMint: string;
  setStatus: (status: string) => void;
  onOperationComplete: () => void;
  loading?: boolean;
  tokenInfo?: TokenInfo | null;
  mintInfo?: MintInfo | null;
}

export const TokenApprovalOperations: React.FC<
  TokenApprovalOperationsProps
> = ({
  tokenMint,
  setStatus,
  onOperationComplete,
  loading,
  tokenInfo,
  mintInfo,
}) => {
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

  const formatAddress = (address: string) => {
    if (address.length < 8) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-6"
    >
      {/* Current Allowance Display */}
      <AnimatePresence>
        {allowance && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Text
                      variant="small"
                      weight="semibold"
                      className="text-blue-800 dark:text-blue-200"
                    >
                      Active Token Allowance
                    </Text>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Text variant="extraSmall" color="muted">
                          Delegate Address:
                        </Text>
                        <Text variant="small" className="font-mono break-all">
                          {formatAddress(allowance.delegate)}
                        </Text>
                      </div>
                      <div>
                        <Text variant="extraSmall" color="muted">
                          Approved Amount:
                        </Text>
                        <Text
                          variant="small"
                          weight="semibold"
                          className="text-blue-600 dark:text-blue-400"
                        >
                          {allowance.amount.toLocaleString()} tokens
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve and Revoke Operations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Approve Tokens */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>

            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>
                    <Text
                      variant="h5"
                      className="text-green-600 dark:text-green-400 font-bold"
                    >
                      Approve Tokens
                    </Text>
                  </CardTitle>
                  <CardDescription>
                    <Text variant="small" color="muted">
                      Allow another address to spend your tokens
                    </Text>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <Text variant="small" weight="medium">
                    Delegate Address
                  </Text>
                </div>
                <input
                  type="text"
                  value={delegateAddress}
                  onChange={(e) => setDelegateAddress(e.target.value)}
                  placeholder="Enter delegate address..."
                  disabled={approveLoading}
                  className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 ${
                    delegateAddress && !isValidSolanaAddress(delegateAddress)
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 dark:border-red-700"
                      : delegateAddress && isValidSolanaAddress(delegateAddress)
                      ? "border-green-300 bg-green-50 dark:bg-green-900/20 focus:ring-green-500 dark:border-green-700"
                      : "border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500"
                  } focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800`}
                />

                <AnimatePresence>
                  {delegateAddress && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isValidSolanaAddress(delegateAddress) ? (
                        <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                          <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                          <Text
                            variant="extraSmall"
                            className="text-green-800 dark:text-green-200"
                          >
                            Valid delegate address
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
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <Text variant="small" weight="medium">
                    Amount to Approve
                  </Text>
                </div>
                <input
                  type="number"
                  value={approveAmount}
                  onChange={(e) => setApproveAmount(e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 transition-colors"
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
                  !isValidSolanaAddress(delegateAddress) ||
                  !approveAmount ||
                  parseFloat(approveAmount) <= 0
                }
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg group border-0"
              >
                {approveLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Approving...</span>
                  </div>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Approve Tokens</span>
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revoke Approval */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>

            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 shadow-sm">
                  <ShieldX className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>
                    <Text
                      variant="h5"
                      className="text-red-600 dark:text-red-400 font-bold"
                    >
                      Revoke Approval
                    </Text>
                  </CardTitle>
                  <CardDescription>
                    <Text variant="small" color="muted">
                      Remove all token spending permissions
                    </Text>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="py-6 text-center space-y-4">
                <div className="relative mx-auto w-fit">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-400 to-pink-400 opacity-20 blur"></div>
                  <div className="relative p-3 bg-red-100/50 dark:bg-red-900/30 rounded-full">
                    <ShieldX className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Text
                    variant="small"
                    weight="medium"
                    className="text-red-800 dark:text-red-200"
                  >
                    Security Action
                  </Text>
                  <Text
                    variant="extraSmall"
                    color="muted"
                    className="max-w-xs mx-auto"
                  >
                    This will revoke all current token approvals for this token.
                    The action cannot be undone.
                  </Text>
                </div>

                <Button
                  onClick={handleRevokeApproval}
                  disabled={revokeLoading || !tokenMint || !allowance}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg group border-0"
                >
                  {revokeLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Revoking...</span>
                    </div>
                  ) : (
                    <>
                      <ShieldX className="h-4 w-4 mr-2" />
                      <span>Revoke Approval</span>
                    </>
                  )}
                </Button>
              </div>

              {!allowance && !allowanceLoading && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                  <Text variant="extraSmall" color="muted">
                    No active approvals found for this token
                  </Text>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transfer From (Delegate Operation) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm">
                <ArrowRightLeft className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>
                  <Text
                    variant="h5"
                    className="text-blue-600 dark:text-blue-400 font-bold"
                  >
                    Transfer From (Delegate)
                  </Text>
                </CardTitle>
                <CardDescription>
                  <Text variant="small" color="muted">
                    Transfer tokens from an owner who approved you as delegate
                  </Text>
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Text variant="small" weight="medium">
                    Owner Address
                  </Text>
                </div>
                <input
                  type="text"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  placeholder="Token owner address..."
                  disabled={transferFromLoading}
                  className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 ${
                    ownerAddress && !isValidSolanaAddress(ownerAddress)
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 dark:border-red-700"
                      : ownerAddress && isValidSolanaAddress(ownerAddress)
                      ? "border-green-300 bg-green-50 dark:bg-green-900/20 focus:ring-green-500 dark:border-green-700"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  } focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800`}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Text variant="small" weight="medium">
                    Recipient Address
                  </Text>
                </div>
                <input
                  type="text"
                  value={transferFromRecipient}
                  onChange={(e) => setTransferFromRecipient(e.target.value)}
                  placeholder="Recipient address..."
                  disabled={transferFromLoading}
                  className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 ${
                    transferFromRecipient &&
                    !isValidSolanaAddress(transferFromRecipient)
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 dark:border-red-700"
                      : transferFromRecipient &&
                        isValidSolanaAddress(transferFromRecipient)
                      ? "border-green-300 bg-green-50 dark:bg-green-900/20 focus:ring-green-500 dark:border-green-700"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  } focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800`}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <ArrowRightLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Text variant="small" weight="medium">
                    Amount
                  </Text>
                </div>
                <input
                  type="number"
                  value={transferFromAmount}
                  onChange={(e) => setTransferFromAmount(e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 transition-colors"
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
                !isValidSolanaAddress(transferFromRecipient) ||
                !transferFromAmount ||
                parseFloat(transferFromAmount) <= 0
              }
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg group border-0"
              size="lg"
            >
              {transferFromLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Transferring from owner...</span>
                </div>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  <span>Transfer From Owner</span>
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>

            {/* Info Panel */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <Text variant="extraSmall" weight="medium">
                  Delegate Transfer
                </Text>
              </div>
              <Text variant="extraSmall" color="muted">
                You must be approved by the owner to transfer their tokens •
                Amount cannot exceed approved allowance
              </Text>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
