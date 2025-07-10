"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, Button, Text } from "@/components/ui/common";

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children, fallback }) => {
  const { isAuthenticated } = useAuth();
  const { connected } = useWallet();

  if (!connected) {
    return (
      fallback || (
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              <div className="space-y-2">
                <Text
                  variant="h4"
                  color="primary"
                  weight="semibold"
                  align="center"
                >
                  Connect Your Wallet
                </Text>
                <Text variant="body" color="muted" align="center">
                  Please connect your wallet to access this feature
                </Text>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-4 h-4 text-blue-500">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <Text variant="small" color="primary" weight="medium">
                    Getting Started
                  </Text>
                </div>
                <Text variant="extraSmall" color="muted" align="center">
                  Use the "Connect Wallet" button above to connect your Phantom
                  wallet and start using the application.
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-amber-500 dark:text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div className="space-y-2">
                <Text
                  variant="h4"
                  color="primary"
                  weight="semibold"
                  align="center"
                >
                  Authentication Required
                </Text>
                <Text variant="body" color="muted" align="center">
                  Please sign the message to verify your wallet ownership
                </Text>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-4 h-4 text-amber-500">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <Text variant="small" color="warning" weight="medium">
                    Verification Pending
                  </Text>
                </div>
                <Text variant="extraSmall" color="muted" align="center">
                  A signature request should appear shortly. If not, try
                  refreshing the page.
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    );
  }

  return <>{children}</>;
};
