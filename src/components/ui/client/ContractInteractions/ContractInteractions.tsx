"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Button,
  Text,
} from "@/components/ui/common";

export const ContractInteractions: React.FC = () => {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();

  // Simple navigation - all functionality moved to individual pages

  // Show loading state if wallet is not ready
  if (!wallet.connected) {
    return (
      <AuthGate>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <Text variant="h5" color="muted">
              Please connect your wallet to interact with Solana programs
            </Text>
          </CardContent>
        </Card>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h3" color="primary">
                Contract Interactions
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="body" color="muted">
                Interact with deployed Solana programs, send memos, and explore
                on-chain data
              </Text>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Memo Program */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                Memo Program
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/memo")}
              variant="default"
              className="w-full"
            >
              Go to Memo Program
            </Button>
          </CardContent>
        </Card>

        {/* SOL Transfer */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                Transfer SOL
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/transfer-sol")}
              variant="default"
              className="w-full"
            >
              Go to Transfer SOL
            </Button>
          </CardContent>
        </Card>

        {/* Account Reader */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                Account Reader
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/account-reader")}
              variant="default"
              className="w-full"
            >
              Go to Account Reader
            </Button>
          </CardContent>
        </Card>

        {/* Route to DeFi*/}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                DeFi
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/defi")}
              variant="default"
              className="w-full"
            >
              Go to DeFi
            </Button>
          </CardContent>
        </Card>


      </div>
    </AuthGate>
  );
};

// Helper component to display wallet balance
const WalletBalance: React.FC = () => {
  const systemService = useSystemService();
  const [balance, setBalance] = React.useState<number | null>(null);

  React.useEffect(() => {
    const loadBalance = async () => {
      const bal = await systemService.getBalance();
      setBalance(bal);
    };
    loadBalance();
  }, [systemService]);

  if (balance === null) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        <Text variant="small" color="muted">
          Loading balance...
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Text variant="small" weight="medium">
        Balance: {balance.toFixed(4)} SOL
      </Text>
    </div>
  );
};
