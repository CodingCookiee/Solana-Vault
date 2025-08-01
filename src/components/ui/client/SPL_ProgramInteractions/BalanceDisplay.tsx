"use client";

import React from "react";
import { motion } from "framer-motion";
import { Text, Card, CardContent } from "@/components/ui/common";
import { Wallet, TrendingUp, Loader2 } from "lucide-react";

interface BalanceDisplayProps {
  solBalance: number | null;
  loading: boolean;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  solBalance,
  loading,
}) => {
  const getBalanceColor = () => {
    if (solBalance === null) return "text-gray-500";
    if (solBalance < 0.001) return "text-red-500";
    if (solBalance < 0.1) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <Text variant="small" color="muted" weight="medium">
                  Current SOL Balance
                </Text>
              </div>

              <div className="flex items-baseline space-x-2">
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                    <Text
                      variant="h3"
                      className="text-blue-600 dark:text-blue-400 font-bold"
                    >
                      Loading...
                    </Text>
                  </div>
                ) : (
                  <>
                    <Text
                      variant="h2"
                      className={`font-bold ${getBalanceColor()}`}
                    >
                      {solBalance?.toFixed(4) || "0.0000"}
                    </Text>
                    <Text variant="small" color="muted">
                      SOL
                    </Text>
                  </>
                )}
              </div>

              {!loading && solBalance !== null && (
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <Text
                    variant="extraSmall"
                    className="text-green-600 dark:text-green-400"
                  >
                    ≈ ${(solBalance * 23.45).toFixed(2)} USD
                  </Text>
                </div>
              )}
            </div>

            {/* Balance Status Indicator */}
            <div className="text-right">
              {!loading && solBalance !== null && (
                <div className="space-y-2">
                  <div
                    className={`w-3 h-3 rounded-full ml-auto ${
                      solBalance < 0.001
                        ? "bg-red-500"
                        : solBalance < 0.1
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    } animate-pulse`}
                  ></div>
                  <Text
                    variant="extraSmall"
                    className={
                      solBalance < 0.001
                        ? "text-red-600 dark:text-red-400"
                        : solBalance < 0.1
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                    }
                  >
                    {solBalance < 0.001
                      ? "Low"
                      : solBalance < 0.1
                      ? "Moderate"
                      : "Sufficient"}
                  </Text>
                </div>
              )}
            </div>
          </div>

          {/* Balance Warning */}
          {!loading && solBalance !== null && solBalance < 0.001 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <Text
                  variant="extraSmall"
                  className="text-red-800 dark:text-red-200"
                >
                  ⚠️ Low SOL balance. You may need more SOL for transaction
                  fees.
                </Text>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
