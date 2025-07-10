"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Button,
  Text,
} from "@/components/ui/common";

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authenticate,
    isAuthenticating,
    authMessage,
  } = useAuth();
  const { publicKey, disconnect } = useWallet();

  const handleSign = async () => {
    try {
      await authenticate();
    } catch (error) {
      console.error("Authentication failed:", error);
      alert("Authentication failed. Please try again.");
    }
  };

  const handleCancel = () => {
    setShowAuthModal(false);
    disconnect();
  };

  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100 p-4">
      <Card className="max-w-md w-full mx-auto shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <CardTitle>
                  <Text variant="h5" color="primary" weight="semibold">
                    Verify Wallet
                  </Text>
                </CardTitle>
                <CardDescription>
                  <Text variant="small" color="muted">
                    Sign to verify ownership
                  </Text>
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleCancel}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Warning Notice */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <Text
                  variant="small"
                  color="warning"
                  weight="medium"
                  className="mb-1"
                >
                  Authentication Required
                </Text>
                <Text variant="extraSmall" color="muted">
                  You must sign a message to verify wallet ownership and access
                  the application features.
                </Text>
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="space-y-3">
            <div>
              <Text
                variant="small"
                weight="medium"
                color="default"
                className="mb-2"
              >
                Connected Wallet:
              </Text>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <Text
                  variant="extraSmall"
                  className="font-mono text-gray-700 dark:text-gray-300 break-all"
                >
                  {publicKey?.toBase58()}
                </Text>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              size="default"
              className="flex-1"
            >
              <Text variant="small" weight="medium">
                Cancel
              </Text>
            </Button>
            <Button
              onClick={handleSign}
              disabled={isAuthenticating}
              variant="default"
              size="default"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isAuthenticating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <Text variant="small" weight="medium" className="text-white">
                    Signing...
                  </Text>
                </div>
              ) : (
                <Text variant="small" weight="medium" className="text-white">
                  Sign Message
                </Text>
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 text-green-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <Text variant="extraSmall" color="muted" align="center">
                Your private key never leaves your wallet. This signature only
                verifies ownership.
              </Text>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
