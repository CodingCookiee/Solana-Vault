"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card";
import { Button } from "@/components/ui/common/button";
import { Text } from "@/components/ui/common/text";
import { CreateCollection } from "./CreateCollection";
import { CreateNFT } from "./CreateNFT";
import { VerifyNFT } from "./VerifyNFT";
import { CollectionDetails, NFTDetails } from "@/services/nft/nft.types";

type ActiveTab = "collection" | "nft" | "verify";

export function NFTContainer() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("collection");
  const [createdCollection, setCreatedCollection] =
    useState<CollectionDetails | null>(null);
  const [createdNFT, setCreatedNFT] = useState<NFTDetails | null>(null);

  const tabs = [
    { id: "collection" as ActiveTab, label: "Create Collection", icon: "📁" },
    { id: "nft" as ActiveTab, label: "Create NFT", icon: "🖼️" },
    { id: "verify" as ActiveTab, label: "Verify NFT", icon: "✅" },
  ];

  const handleCollectionCreated = (collection: CollectionDetails) => {
    setCreatedCollection(collection);
    // Automatically move to NFT creation after collection is created
    setActiveTab("nft");
  };

  const handleNFTCreated = (nft: NFTDetails) => {
    setCreatedNFT(nft);
    // If NFT has a collection, move to verification tab
    if (nft.collection) {
      setActiveTab("verify");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with title and description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎨</span>
            Solana NFT System
          </CardTitle>
          <Text color="secondary" variant="small">
            Create collections, mint NFTs, and verify collection membership
          </Text>
        </CardHeader>
      </Card>

      {/* Display summary of created items */}
      {(createdCollection || createdNFT) && (
        <Card>
          <CardHeader>
            <CardTitle variant="small">Created Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {createdCollection && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Text variant="small" weight="medium" className="mb-1">
                  📁 {createdCollection.name}
                </Text>
                <Text variant="extraSmall" color="muted" className="font-mono">
                  {createdCollection.mint.toString()}
                </Text>
              </div>
            )}
            {createdNFT && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <Text variant="small" weight="medium" className="mb-1">
                  🖼️ {createdNFT.name}
                </Text>
                <Text variant="extraSmall" color="muted" className="font-mono">
                  {createdNFT.mint.toString()}
                </Text>
                {createdNFT.collection && (
                  <Text variant="extraSmall" color="muted">
                    In collection:{" "}
                    {createdNFT.collection.toString().slice(0, 8)}...
                  </Text>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab navigation */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tab content */}
      <div className="min-h-[600px]">
        {activeTab === "collection" && (
          <CreateCollection onCollectionCreated={handleCollectionCreated} />
        )}

        {activeTab === "nft" && (
          <CreateNFT
            collectionMint={createdCollection?.mint.toString()}
            onNFTCreated={handleNFTCreated}
          />
        )}

        {activeTab === "verify" && <VerifyNFT />}
      </div>

      {/* Workflow guide */}
      <Card>
        <CardHeader>
          <CardTitle variant="small">How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                1
              </div>
              <div>
                <Text variant="small" weight="medium">
                  Create Collection
                </Text>
                <Text variant="extraSmall" color="muted">
                  First, create an NFT collection that will serve as the parent
                  for your NFTs
                </Text>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 dark:bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <div>
                <Text variant="small" weight="medium">
                  Create NFT
                </Text>
                <Text variant="extraSmall" color="muted">
                  Mint an NFT and assign it to your collection
                </Text>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500 dark:bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <div>
                <Text variant="small" weight="medium">
                  Verify NFT
                </Text>
                <Text variant="extraSmall" color="muted">
                  Verify that your NFT belongs to the collection to establish
                  authenticity
                </Text>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
