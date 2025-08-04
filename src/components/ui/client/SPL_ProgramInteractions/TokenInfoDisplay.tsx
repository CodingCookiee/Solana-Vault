"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Text,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui/common";
import type { TokenInfo, MintInfo } from "@/services/spl-tokens";
import {
  Wallet,
  Database,
  Coins,
  Shield,
  Hash,
  TrendingUp,
  Copy,
  ExternalLink,
  Eye,
  Crown,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface TokenInfoDisplayProps {
  tokenInfo: TokenInfo | null;
  mintInfo: MintInfo | null;
}

export const TokenInfoDisplay: React.FC<TokenInfoDisplayProps> = ({
  tokenInfo,
  mintInfo,
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatAddress = (address: string) => {
    if (address.length < 8) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 9,
    }).format(num);
  };

  if (!tokenInfo && !mintInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid md:grid-cols-2 gap-6"
    >
      {/* Token Account Info */}
      <AnimatePresence>
        {tokenInfo && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>
                      <Text
                        variant="h5"
                        className="text-blue-600 dark:text-blue-400 font-bold"
                      >
                        Your Token Account
                      </Text>
                    </CardTitle>
                    <Text variant="small" color="muted">
                      Personal token holdings
                    </Text>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Balance Display */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <Text
                        variant="small"
                        weight="medium"
                        className="text-blue-800 dark:text-blue-200"
                      >
                        Token Balance
                      </Text>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <Text
                        variant="extraSmall"
                        className="text-green-600 dark:text-green-400"
                      >
                        Available
                      </Text>
                    </div>
                  </div>
                  <Text
                    variant="h3"
                    className="text-blue-600 dark:text-blue-400 font-bold"
                  >
                    {formatNumber(tokenInfo.balance)}
                  </Text>
                  <Text variant="extraSmall" color="muted">
                    tokens in your account
                  </Text>
                </div>

                {/* Account Address */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Text variant="small" weight="medium">
                      Account Address
                    </Text>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <Text
                        variant="extraSmall"
                        color="muted"
                        className="font-mono break-all pr-2"
                      >
                        {tokenInfo.account}
                      </Text>
                      <div className="flex space-x-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(tokenInfo.account)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://explorer.solana.com/address/${tokenInfo.account}?cluster=devnet`,
                              "_blank"
                            )
                          }
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-center">
                    <Text variant="extraSmall" color="muted">
                      Status
                    </Text>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <Text
                        variant="small"
                        weight="medium"
                        className="text-green-600 dark:text-green-400"
                      >
                        Active
                      </Text>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-center">
                    <Text variant="extraSmall" color="muted">
                      Type
                    </Text>
                    <Text
                      variant="small"
                      weight="medium"
                      className="text-blue-600 dark:text-blue-400 mt-1"
                    >
                      SPL Token
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mint Info */}
      <AnimatePresence>
        {mintInfo && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>
                      <Text
                        variant="h5"
                        className="text-purple-600 dark:text-purple-400 font-bold"
                      >
                        Token Mint Info
                      </Text>
                    </CardTitle>
                    <Text variant="small" color="muted">
                      Global token statistics
                    </Text>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Supply & Decimals Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <Text
                        variant="extraSmall"
                        weight="medium"
                        className="text-purple-800 dark:text-purple-200"
                      >
                        Total Supply
                      </Text>
                    </div>
                    <Text
                      variant="h4"
                      className="text-purple-600 dark:text-purple-400 font-bold"
                    >
                      {formatNumber(mintInfo.supply)}
                    </Text>
                    <Text variant="extraSmall" color="muted">
                      tokens minted
                    </Text>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <Text
                        variant="extraSmall"
                        weight="medium"
                        className="text-purple-800 dark:text-purple-200"
                      >
                        Decimals
                      </Text>
                    </div>
                    <Text
                      variant="h4"
                      className="text-purple-600 dark:text-purple-400 font-bold"
                    >
                      {mintInfo.decimals}
                    </Text>
                    <Text variant="extraSmall" color="muted">
                      precision
                    </Text>
                  </div>
                </div>

                {/* Mint Authority */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <Text variant="small" weight="medium">
                      Mint Authority
                    </Text>
                  </div>

                  {mintInfo.mintAuthority ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <Text
                            variant="extraSmall"
                            color="muted"
                            className="font-mono break-all pr-2"
                          >
                            {mintInfo.mintAuthority}
                          </Text>
                          <div className="flex items-center space-x-1 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <Text
                              variant="extraSmall"
                              className="text-green-600 dark:text-green-400"
                            >
                              Can mint additional tokens
                            </Text>
                          </div>
                        </div>
                        <div className="flex space-x-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(mintInfo.mintAuthority!)
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `https://explorer.solana.com/address/${mintInfo.mintAuthority}?cluster=devnet`,
                                "_blank"
                              )
                            }
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <div>
                          <Text
                            variant="small"
                            weight="medium"
                            className="text-red-800 dark:text-red-200"
                          >
                            No Mint Authority
                          </Text>
                          <Text
                            variant="extraSmall"
                            className="text-red-700 dark:text-red-300"
                          >
                            Fixed supply - no additional tokens can be minted
                          </Text>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Token Properties */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-center">
                    <Text variant="extraSmall" color="muted">
                      Freeze Authority
                    </Text>
                    <Text
                      variant="small"
                      weight="medium"
                      className="text-purple-600 dark:text-purple-400 mt-1"
                    >
                      {mintInfo.freezeAuthority ? "Enabled" : "Disabled"}
                    </Text>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-center">
                    <Text variant="extraSmall" color="muted">
                      Token Standard
                    </Text>
                    <Text
                      variant="small"
                      weight="medium"
                      className="text-purple-600 dark:text-purple-400 mt-1"
                    >
                      SPL-Token
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
