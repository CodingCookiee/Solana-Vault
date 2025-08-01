"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Text,
} from "@/components/ui/common";
import {
  ArrowLeftRight,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Copy,
  ExternalLink,
  X,
  Wallet,
  DollarSign,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface TransferSolProps {
  solRecipient: string;
  setSolRecipient: (address: string) => void;
  solAmount: string;
  setSolAmount: (amount: string) => void;
  handleTransferSol: () => void;
  isValidSolanaAddress: (address: string) => boolean;
  systemService: {
    loading: boolean;
    error: string | null;
    clearError: () => void;
    validateAmount: (amount: number) => { valid: boolean; error?: string };
  };
  isLoading: boolean;
  status: string;
  setStatus: (status: string) => void;
  lastTransaction?: string;
  balance?: number;
}

export const TransferSol: React.FC<TransferSolProps> = ({
  solRecipient,
  setSolRecipient,
  solAmount,
  setSolAmount,
  handleTransferSol,
  isValidSolanaAddress,
  systemService,
  isLoading,
  status,
  setStatus,
  lastTransaction,
  balance,
}) => {
  const amountValidation = systemService.validateAmount(
    parseFloat(solAmount || "0")
  );
  const isRecipientValid = solRecipient
    ? isValidSolanaAddress(solRecipient)
    : false;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatAddress = (address: string) => {
    if (address.length < 8) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const getAmountInUSD = (sol: string) => {
    const amount = parseFloat(sol);
    if (isNaN(amount)) return "0.00";
    return (amount * 23.45).toFixed(2); // Mock SOL price
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm">
              <ArrowLeftRight className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>
                <Text
                  variant="h5"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold"
                >
                  SOL Transfer
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="small" color="muted">
                  Transfer SOL using the System Program
                </Text>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Balance Display */}
          {balance !== undefined && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Text variant="small" weight="medium">
                    Available Balance
                  </Text>
                </div>
                <div className="text-right">
                  <Text
                    variant="h4"
                    className="text-blue-600 dark:text-blue-400 font-bold"
                  >
                    {balance.toFixed(4)} SOL
                  </Text>
                  <Text variant="extraSmall" color="muted">
                    ≈ ${(balance * 23.45).toFixed(2)} USD
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Form */}
          <div className="grid gap-6">
            {/* Recipient Address */}
            <div className="space-y-3">
              <label className="block">
                <Text variant="small" weight="medium" color="default">
                  Recipient Address
                </Text>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={solRecipient}
                  onChange={(e) => setSolRecipient(e.target.value)}
                  placeholder="Enter recipient wallet address..."
                  className={`w-full p-4 pr-12 border rounded-lg text-sm transition-all duration-200 ${
                    solRecipient && !isRecipientValid
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 dark:border-red-700"
                      : solRecipient && isRecipientValid
                      ? "border-green-300 bg-green-50 dark:bg-green-900/20 focus:ring-green-500 dark:border-green-700"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  } focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800`}
                />

                {solRecipient && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isRecipientValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>

              {/* Address Validation Feedback */}
              <AnimatePresence>
                {solRecipient && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isRecipientValid ? (
                      <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <Text
                          variant="extraSmall"
                          className="text-green-800 dark:text-green-200 font-medium"
                        >
                          Valid recipient address
                        </Text>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
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

              {/* Test Address Suggestion */}
              {!solRecipient && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-2">
                    <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-800/50 mt-0.5">
                      <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-2">
                      <Text
                        variant="extraSmall"
                        weight="medium"
                        className="text-blue-800 dark:text-blue-200"
                      >
                        Need a test address?
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setSolRecipient("11111111111111111111111111111112")
                        }
                        className="h-7 px-2 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-800/50 dark:hover:bg-blue-700/50 text-blue-700 dark:text-blue-300"
                      >
                        Use System Program Address
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block">
                  <Text variant="small" weight="medium" color="default">
                    Amount (SOL)
                  </Text>
                </label>
                {solAmount && (
                  <Text variant="extraSmall" color="muted">
                    ≈ ${getAmountInUSD(solAmount)} USD
                  </Text>
                )}
              </div>

              <div className="relative">
                <input
                  type="number"
                  value={solAmount}
                  onChange={(e) => setSolAmount(e.target.value)}
                  placeholder="0.001"
                  step="0.000000001"
                  min="0"
                  max={balance}
                  className={`w-full p-4 pr-16 border rounded-lg text-lg font-medium transition-colors ${
                    solAmount && !amountValidation.valid
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 dark:border-red-700"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  } focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800`}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Text variant="small" color="muted" weight="medium">
                    SOL
                  </Text>
                </div>
              </div>

              {/* Amount Validation */}
              <AnimatePresence>
                {solAmount && !amountValidation.valid && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <Text
                        variant="extraSmall"
                        className="text-red-800 dark:text-red-200"
                      >
                        {amountValidation.error}
                      </Text>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Amount Buttons */}
              {balance && balance > 0 && (
                <div className="flex space-x-2">
                  {[0.001, 0.01, 0.1]
                    .filter((amt) => amt <= balance)
                    .map((amt) => (
                      <Button
                        key={amt}
                        variant="outline"
                        size="sm"
                        onClick={() => setSolAmount(amt.toString())}
                        className="text-xs h-7 px-3 border-gray-200 dark:border-gray-700"
                      >
                        {amt} SOL
                      </Button>
                    ))}
                  {balance > 0.001 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSolAmount((balance * 0.5).toFixed(6))}
                      className="text-xs h-7 px-3 border-gray-200 dark:border-gray-700"
                    >
                      50%
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Transfer Button */}
          <Button
            onClick={handleTransferSol}
            disabled={
              isLoading ||
              systemService.loading ||
              !solRecipient ||
              !solAmount ||
              !isRecipientValid ||
              !amountValidation.valid
            }
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg group border-0"
            size="lg"
          >
            {isLoading || systemService.loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Transfer...</span>
              </div>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                <span>Transfer SOL</span>
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          {/* Transaction Fee Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <Text variant="extraSmall" weight="medium">
                Transaction Details
              </Text>
            </div>
            <Text variant="extraSmall" color="muted">
              Network fee: ~0.000005 SOL • Program: System Program • Total cost:{" "}
              {solAmount
                ? (parseFloat(solAmount) + 0.000005).toFixed(6)
                : "0.000005"}{" "}
              SOL
            </Text>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      <AnimatePresence>
        {systemService.error && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <Card className="border-red-200 dark:border-red-800 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-400 to-pink-400"></div>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30 mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <Text
                      variant="small"
                      weight="medium"
                      className="text-red-800 dark:text-red-200 mb-1"
                    >
                      Transfer Error
                    </Text>
                    <Text
                      variant="extraSmall"
                      className="text-red-700 dark:text-red-300"
                    >
                      {systemService.error}
                    </Text>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={systemService.clearError}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Display */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <Card
              className={`overflow-hidden ${
                status.includes("❌")
                  ? "border-red-200 dark:border-red-800"
                  : status.includes("✅")
                  ? "border-green-200 dark:border-green-800"
                  : "border-blue-200 dark:border-blue-800"
              }`}
            >
              <div
                className={`h-1 ${
                  status.includes("❌")
                    ? "bg-gradient-to-r from-red-400 to-pink-400"
                    : status.includes("✅")
                    ? "bg-gradient-to-r from-green-400 to-emerald-400"
                    : "bg-gradient-to-r from-blue-400 to-purple-400"
                }`}
              ></div>

              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-1.5 rounded-full mt-0.5 ${
                      status.includes("❌")
                        ? "bg-red-100 dark:bg-red-900/30"
                        : status.includes("✅")
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-blue-100 dark:bg-blue-900/30"
                    }`}
                  >
                    {status.includes("❌") ? (
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    ) : status.includes("✅") ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <Text
                      variant="small"
                      weight="medium"
                      className={
                        status.includes("❌")
                          ? "text-red-800 dark:text-red-200"
                          : status.includes("✅")
                          ? "text-green-800 dark:text-green-200"
                          : "text-blue-800 dark:text-blue-200"
                      }
                    >
                      Transfer Status
                    </Text>

                    <Text
                      variant="extraSmall"
                      color="muted"
                      className="break-all"
                    >
                      {status}
                    </Text>

                    {/* Transaction Hash Display */}
                    {lastTransaction && status.includes("✅") && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Text variant="extraSmall" color="muted">
                          Transaction:
                        </Text>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                          {formatAddress(lastTransaction)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(lastTransaction)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://explorer.solana.com/tx/${lastTransaction}?cluster=devnet`,
                              "_blank"
                            )
                          }
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatus("")}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
