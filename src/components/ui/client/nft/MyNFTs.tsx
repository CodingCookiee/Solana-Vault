"use client";

import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card";
import { Text } from "@/components/ui/common/text";
import { Button } from "@/components/ui/common/button";
import { useWalletNFTs } from "@/services/nft/nft.hooks";
import { useWallet } from "@solana/wallet-adapter-react";

export function MyNFTs() {
  const { connected } = useWallet();
  const { collections, nfts, loading, error, refresh } = useWalletNFTs();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Text color="muted" align="center">
            Please connect your wallet to view your NFTs
          </Text>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Text align="center">Loading your NFTs from wallet...</Text>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Text color="error" align="center" className="mb-4">
            Error loading NFTs: {error}
          </Text>
          <Button onClick={refresh} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span>💎</span>
              My Wallet NFTs & Collections
            </CardTitle>
            <Button
              onClick={refresh}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Text variant="small" color="muted">
            Showing all NFTs and collections in your connected wallet. Data is fetched directly from the Solana blockchain.
          </Text>
        </CardContent>
      </Card>

      {/* Collections Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📁</span>
            Collections ({collections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {collections.length === 0 ? (
            <Text color="muted" align="center">
              No collections found in your wallet
            </Text>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collections.map((collection) => (
                <div
                  key={collection.mint.toString()}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Text weight="medium" className="mb-1">
                        {collection.name}
                      </Text>
                      <Text variant="small" color="muted" className="mb-2">
                        {collection.symbol}
                      </Text>
                      <Text variant="extraSmall" color="muted">
                        {collection.description || "No description"}
                      </Text>
                    </div>
                    {collection.image && (
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-16 h-16 object-cover rounded-lg border ml-3"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Text variant="extraSmall" color="muted">
                        Mint Address:
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(collection.mint.toString())
                        }
                        className="h-6 px-2 text-xs"
                      >
                        Copy
                      </Button>
                    </div>
                    <Text variant="extraSmall" className="font-mono break-all">
                      {collection.mint.toString()}
                    </Text>

                    <div className="flex items-center justify-between pt-2">
                      <Text variant="extraSmall" color="muted">
                        Type: Collection
                      </Text>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <Text variant="extraSmall" color="muted">
                          In Wallet
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* NFTs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🖼️</span>
            NFTs ({nfts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nfts.length === 0 ? (
            <Text color="muted" align="center">
              No NFTs found in your wallet
            </Text>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nfts.map((nft) => (
                <div
                  key={nft.mint.toString()}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Text weight="medium" className="mb-1">
                        {nft.name}
                      </Text>
                      <Text variant="small" color="muted" className="mb-2">
                        {nft.symbol}
                      </Text>
                      <Text variant="extraSmall" color="muted">
                        {nft.description || "No description"}
                      </Text>
                    </div>
                    {nft.image && (
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-16 h-16 object-cover rounded-lg border ml-3"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    {nft.collection && (
                      <div>
                        <Text variant="extraSmall" color="muted">
                          Collection: {nft.collection.toString().slice(0, 8)}...
                        </Text>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Text variant="extraSmall" color="muted">
                        Verified:
                      </Text>
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            nft.verified ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <Text
                          variant="extraSmall"
                          color={nft.verified ? "success" : "error"}
                        >
                          {nft.verified ? "Yes" : "No"}
                        </Text>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Text variant="extraSmall" color="muted">
                        Mint Address:
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(nft.mint.toString())}
                        className="h-6 px-2 text-xs"
                      >
                        Copy
                      </Button>
                    </div>
                    <Text variant="extraSmall" className="font-mono break-all">
                      {nft.mint.toString()}
                    </Text>

                    <div className="flex items-center justify-between pt-2">
                      <Text variant="extraSmall" color="muted">
                        Type: NFT
                      </Text>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <Text variant="extraSmall" color="muted">
                          In Wallet
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}