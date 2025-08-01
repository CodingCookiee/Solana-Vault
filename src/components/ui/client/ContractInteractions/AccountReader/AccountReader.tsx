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
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Copy,
  ExternalLink,
  X,
  Database,
  Wallet,
  Shield,
  Clock,
  FileText,
  Zap,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface AccountReaderProps {
  accountToRead: string;
  setAccountToRead: (address: string) => void;
  accountData: any;
  handleReadAccount: () => void;
  isValidSolanaAddress: (address: string) => boolean;
  accountService: {
    loading: boolean;
    error: string | null;
    clearError: () => void;
  };
  isLoading: boolean;
  status: string;
  setStatus: (status: string) => void;
}

export const AccountReader: React.FC<AccountReaderProps> = ({
  accountToRead,
  setAccountToRead,
  accountData,
  handleReadAccount,
  isValidSolanaAddress,
  accountService,
  isLoading,
  status,
  setStatus,
}) => {
  const isAddressValid = accountToRead
    ? isValidSolanaAddress(accountToRead)
    : false;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatAddress = (address: string) => {
    if (address.length < 8) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatLamports = (lamports: number) => {
    return (lamports / 1e9).toFixed(9);
  };

  const getOwnerDisplayName = (owner: string) => {
    const programs: { [key: string]: string } = {
      "11111111111111111111111111111112": "System Program",
      TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "Token Program",
      ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: "Associated Token Program",
      So11111111111111111111111111111111111111112: "Wrapped SOL",
    };
    return programs[owner] || formatAddress(owner);
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
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>
                <Text
                  variant="h5"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold"
                >
                  Account Data Reader
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="small" color="muted">
                  Inspect raw account data from any Solana address
                </Text>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Address Input Section */}
          <div className="space-y-3">
            <label className="block">
              <Text variant="small" weight="medium" color="default">
                Account Address
              </Text>
            </label>

            <div className="relative">
              <input
                type="text"
                value={accountToRead}
                onChange={(e) => setAccountToRead(e.target.value)}
                placeholder="Enter any Solana account address..."
                className={`w-full p-4 pr-12 border rounded-lg text-sm transition-all duration-200 ${
                  accountToRead && !isAddressValid
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 dark:border-red-700"
                    : accountToRead && isAddressValid
                    ? "border-green-300 bg-green-50 dark:bg-green-900/20 focus:ring-green-500 dark:border-green-700"
                    : "border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                } focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800`}
              />

              {accountToRead && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isAddressValid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>

            {/* Address Validation Feedback */}
            <AnimatePresence>
              {accountToRead && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isAddressValid ? (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <Text
                        variant="extraSmall"
                        className="text-green-800 dark:text-green-200 font-medium"
                      >
                        Valid account address
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

            {/* Example Addresses */}
            {!accountToRead && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-800/50 mt-0.5">
                    <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-3">
                    <Text
                      variant="small"
                      weight="medium"
                      className="text-purple-800 dark:text-purple-200"
                    >
                      Try these example addresses:
                    </Text>
                    <div className="space-y-2">
                      {[
                        {
                          label: "System Program",
                          address: "11111111111111111111111111111112",
                        },
                        {
                          label: "Token Program",
                          address:
                            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                        },
                        {
                          label: "Wrapped SOL",
                          address:
                            "So11111111111111111111111111111111111111112",
                        },
                      ].map((example) => (
                        <Button
                          key={example.label}
                          variant="ghost"
                          size="sm"
                          onClick={() => setAccountToRead(example.address)}
                          className="h-auto p-2 text-left bg-purple-100/50 hover:bg-purple-200/50 dark:bg-purple-800/50 dark:hover:bg-purple-700/50 text-purple-700 dark:text-purple-300 justify-start w-full"
                        >
                          <div className="space-y-1">
                            <Text variant="extraSmall" weight="medium">
                              {example.label}
                            </Text>
                            <Text
                              variant="extraSmall"
                              color="muted"
                              className="font-mono"
                            >
                              {formatAddress(example.address)}
                            </Text>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Read Button */}
          <Button
            onClick={handleReadAccount}
            disabled={
              isLoading ||
              accountService.loading ||
              !accountToRead ||
              !isAddressValid
            }
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg group border-0"
            size="lg"
          >
            {isLoading || accountService.loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Reading Account Data...</span>
              </div>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                <span>Read Account Data</span>
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          {/* Account Data Display */}
          <AnimatePresence>
            {accountData && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-purple-200 dark:border-purple-800 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                  <CardContent className="p-0">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-purple-200 dark:border-purple-700">
                      <div className="flex items-center space-x-2 mb-2">
                        <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <Text
                          variant="small"
                          weight="semibold"
                          className="text-purple-800 dark:text-purple-200"
                        >
                          Account Information
                        </Text>
                      </div>
                      <Text variant="extraSmall" color="muted">
                        Complete account details from the blockchain
                      </Text>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Account Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Balance */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-2 mb-2">
                            <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <Text
                              variant="extraSmall"
                              weight="medium"
                              color="muted"
                            >
                              Balance
                            </Text>
                          </div>
                          <Text
                            variant="small"
                            weight="bold"
                            className="text-green-600 dark:text-green-400"
                          >
                            {formatLamports(accountData.lamports)} SOL
                          </Text>
                          <Text variant="extraSmall" color="muted">
                            {accountData.lamports.toLocaleString()} lamports
                          </Text>
                        </div>

                        {/* Data Length */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <Text
                              variant="extraSmall"
                              weight="medium"
                              color="muted"
                            >
                              Data Size
                            </Text>
                          </div>
                          <Text
                            variant="small"
                            weight="bold"
                            className="text-blue-600 dark:text-blue-400"
                          >
                            {accountData.dataLength} bytes
                          </Text>
                        </div>

                        {/* Executable Status */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-2 mb-2">
                            <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <Text
                              variant="extraSmall"
                              weight="medium"
                              color="muted"
                            >
                              Executable
                            </Text>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                accountData.executable
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            <Text
                              variant="small"
                              weight="bold"
                              className={
                                accountData.executable
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-gray-500"
                              }
                            >
                              {accountData.executable ? "Yes" : "No"}
                            </Text>
                          </div>
                        </div>

                        {/* Rent Epoch */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <Text
                              variant="extraSmall"
                              weight="medium"
                              color="muted"
                            >
                              Rent Epoch
                            </Text>
                          </div>
                          <Text
                            variant="small"
                            weight="bold"
                            className="text-purple-600 dark:text-purple-400"
                          >
                            {accountData.rentEpoch}
                          </Text>
                        </div>
                      </div>

                      {/* Owner Info */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center space-x-2 mb-3">
                          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <Text
                            variant="small"
                            weight="semibold"
                            className="text-blue-800 dark:text-blue-200"
                          >
                            Account Owner
                          </Text>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Text
                              variant="small"
                              weight="medium"
                              className="text-blue-700 dark:text-blue-300"
                            >
                              {getOwnerDisplayName(accountData.owner)}
                            </Text>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(accountData.owner)}
                              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                            <Text
                              variant="extraSmall"
                              color="muted"
                              className="font-mono break-all"
                            >
                              {accountData.owner}
                            </Text>
                          </div>
                        </div>
                      </div>

                      {/* Explorer Link */}
                      {accountData.explorerUrl && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            window.open(accountData.explorerUrl, "_blank")
                          }
                          className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on Solana Explorer
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Error Display */}
      <AnimatePresence>
        {accountService.error && (
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
                      Account Read Error
                    </Text>
                    <Text
                      variant="extraSmall"
                      className="text-red-700 dark:text-red-300"
                    >
                      {accountService.error}
                    </Text>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={accountService.clearError}
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

                  <div className="flex-1">
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
                      Account Reader Status
                    </Text>

                    <Text
                      variant="extraSmall"
                      color="muted"
                      className="break-all mt-1"
                    >
                      {status}
                    </Text>
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
