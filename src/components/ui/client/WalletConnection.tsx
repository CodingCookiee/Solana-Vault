"use client";

import { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/common";
import { Text } from "@/components/ui/common";

export const WalletConnection: FC = () => {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const { isAuthenticated, logout } = useAuth();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          <Text variant="h3" color="primary" align="center">
            Wallet Connection
          </Text>
        </CardTitle>
        <CardDescription>
          <Text variant="small" color="muted" align="center">
            Connect your Solana wallet to start using the application
          </Text>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Wallet Connect Button */}
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-blue-500 !hover:from-purple-600 !hover:to-blue-600 !transition-all !duration-200 !shadow-lg !hover:shadow-xl" />
        </div>

        {/* Connection Status */}
        <div className="text-center space-y-4">
          {connecting && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
              <Text variant="small" color="warning">
                Connecting to wallet...
              </Text>
            </div>
          )}

          {connected && publicKey && (
            <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <Text variant="small" color="success" weight="semibold">
                    Wallet Connected
                  </Text>
                </div>
                {isAuthenticated && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <Text variant="small" color="primary" weight="semibold">
                      Authenticated
                    </Text>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Text variant="small" weight="medium" color="default">
                  Public Key:
                </Text>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md border">
                  <Text
                    variant="extraSmall"
                    align="left"
                    className="font-mono break-all text-gray-700 dark:text-gray-300"
                  >
                    {publicKey.toBase58()}
                  </Text>
                </div>
              </div>

              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 shadow-sm hover:shadow-md text-sm font-medium"
              >
                Disconnect & Logout
              </button>
            </div>
          )}

          {!connected && !connecting && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <Text variant="small" color="error" weight="medium">
                  Wallet not connected
                </Text>
              </div>
              <Text
                variant="extraSmall"
                color="muted"
                align="center"
                className="mt-2"
              >
                Please connect your wallet to continue
              </Text>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
