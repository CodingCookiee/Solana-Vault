"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Button,
  Text,
} from "@/components/ui/common";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";

export const RouterContainer: React.FC = () => {
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
        {/* SPL Program  Interactions */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                SPL Program Interactions
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="body" color="muted">
                Interact with SPL token programs, manage token accounts, and
                perform token transfers
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/spl")}
              variant="default"
              className="w-full"
            >
              Go to SPL Program Interactions
            </Button>
          </CardContent>
        </Card>

        {/* NFT Interactions */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                NFT Interactions
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="body" color="muted">
                Explore more features like NFT management and token minting on
                our{" "}
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/nft")}
              variant="default"
              className="w-full"
            >
              NFT Studio page
            </Button>
          </CardContent>
        </Card>
      </div>
    </AuthGate>
  );
};
