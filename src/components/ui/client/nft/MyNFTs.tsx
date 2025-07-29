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
import { useStoredItems } from "@/services/nft/nft.hooks";
import { deleteCollection, deleteNFT } from "@/services/nft/storage";

export function MyNFTs() {
  const { collections, nfts, loading, loadStoredItems, refreshItems } =
    useStoredItems();

  useEffect(() => {
    loadStoredItems();
  }, []);

  const handleDeleteCollection = (mintAddress: string) => {
    if (
      confirm(
        "Are you sure you want to delete this collection from your local storage?"
      )
    ) {
      deleteCollection(mintAddress);
      refreshItems();
    }
  };

  const handleDeleteNFT = (mintAddress: string) => {
    if (
      confirm(
        "Are you sure you want to delete this NFT from your local storage?"
      )
    ) {
      deleteNFT(mintAddress);
      refreshItems();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Text align="center">Loading your NFTs...</Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Collections Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📁</span>
            My Collections ({collections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {collections.length === 0 ? (
            <Text color="muted" align="center">
              No collections created yet
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
                        {collection.description}
                      </Text>
                    </div>
                    {collection.imageUrl && (
                      <img
                        src={collection.imageUrl}
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
                        Created:{" "}
                        {new Date(collection.createdAt).toLocaleDateString()}
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteCollection(collection.mint.toString())
                        }
                        className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
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
            My NFTs ({nfts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nfts.length === 0 ? (
            <Text color="muted" align="center">
              No NFTs created yet
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
                        {nft.description}
                      </Text>
                    </div>
                    {nft.imageUrl && (
                      <img
                        src={nft.imageUrl}
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
                        Created: {new Date(nft.createdAt).toLocaleDateString()}
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNFT(nft.mint.toString())}
                        className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
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
