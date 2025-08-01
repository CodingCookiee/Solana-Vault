"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, Button, Text } from "@/components/ui/common";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface StatusDisplayProps {
  status: string;
  onClear: () => void;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  status,
  onClear,
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Extract transaction signature if present
  const extractTransactionHash = (statusText: string) => {
    const lines = statusText.split("\n");
    for (const line of lines) {
      if (line.includes("Mint Address:")) {
        return line.split("Mint Address: ")[1]?.trim();
      }
      if (line.includes("https://explorer.solana.com/address/")) {
        const url = line.match(
          /https:\/\/explorer\.solana\.com\/address\/([a-zA-Z0-9]+)/
        );
        return url?.[1];
      }
    }
    return null;
  };

  const transactionHash = extractTransactionHash(status);

  if (!status) return null;

  const isError = status.includes("❌");
  const isSuccess = status.includes("✅");
  const isLoading = status.includes("⏳");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`overflow-hidden ${
            isError
              ? "border-red-200 dark:border-red-800"
              : isSuccess
              ? "border-green-200 dark:border-green-800"
              : "border-blue-200 dark:border-blue-800"
          }`}
        >
          <div
            className={`h-1 ${
              isError
                ? "bg-gradient-to-r from-red-400 to-pink-400"
                : isSuccess
                ? "bg-gradient-to-r from-green-400 to-emerald-400"
                : "bg-gradient-to-r from-blue-400 to-purple-400"
            }`}
          ></div>

          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div
                className={`p-1.5 rounded-full mt-0.5 ${
                  isError
                    ? "bg-red-100 dark:bg-red-900/30"
                    : isSuccess
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-blue-100 dark:bg-blue-900/30"
                }`}
              >
                {isError ? (
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                ) : isSuccess ? (
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
                    isError
                      ? "text-red-800 dark:text-red-200"
                      : isSuccess
                      ? "text-green-800 dark:text-green-200"
                      : "text-blue-800 dark:text-blue-200"
                  }
                >
                  {isError
                    ? "Operation Failed"
                    : isSuccess
                    ? "Operation Successful"
                    : "Processing..."}
                </Text>

                <div className="space-y-2">
                  <Text
                    variant="extraSmall"
                    color="muted"
                    className="whitespace-pre-line break-all"
                  >
                    {status}
                  </Text>

                  {/* Transaction Hash Display */}
                  {transactionHash && isSuccess && (
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Text variant="extraSmall" color="muted">
                        Transaction:
                      </Text>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                        {transactionHash.slice(0, 8)}...
                        {transactionHash.slice(-8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transactionHash)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://explorer.solana.com/address/${transactionHash}?cluster=devnet`,
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
              </div>

              <div className="flex space-x-2 shrink-0">
                {isSuccess && (
                  <Button
                    onClick={onClear}
                    variant="outline"
                    size="sm"
                    className={`h-8 px-3 text-xs ${
                      isSuccess
                        ? "border-green-200 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                        : ""
                    }`}
                  >
                    Clear
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
