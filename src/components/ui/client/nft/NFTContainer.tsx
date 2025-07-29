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
import { MyNFTs } from "./MyNFTs";
import { CollectionDetails, NFTDetails } from "@/services/nft/nft.types";

type ActiveTab = "collection" | "nft" | "verify" | "my-nfts";

export function NFTContainer() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("my-nfts");
  const [createdCollection, setCreatedCollection] =
    useState<CollectionDetails | null>(null);
  const [createdNFT, setCreatedNFT] = useState<NFTDetails | null>(null);

  const tabs = [
    { id: "my-nfts" as ActiveTab, label: "My NFTs", icon: "💎" },
    { id: "collection" as ActiveTab, label: "Create Collection", icon: "📁" },
    { id: "nft" as ActiveTab, label: "Create NFT", icon: "🖼️" },
    { id: "verify" as ActiveTab, label: "Verify NFT", icon: "✅" },
  ];

  const handleCollectionCreated = (collection: CollectionDetails) => {
    setCreatedCollection(collection);
    setActiveTab("nft");
  };

  const handleNFTCreated = (nft: NFTDetails) => {
    setCreatedNFT(nft);
    if (nft.collection) {
      setActiveTab("verify");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header with title and description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎨</span>
            Solana NFT Studio
          </CardTitle>
          <Text color="secondary" variant="small">
            Create collections, mint NFTs, verify collection membership, and
            track your creations
          </Text>
        </CardHeader>
      </Card>

      {/* Display summary of created items */}
      {(createdCollection || createdNFT) && (
        <Card>
          <CardHeader>
            <CardTitle variant="small">Recent Activity</CardTitle>
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
        {activeTab === "my-nfts" && <MyNFTs />}

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

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle variant="small">Setup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
          

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <div>
                  <Text variant="small" weight="medium">
                    Create Collection
                  </Text>
                  <Text variant="extraSmall" color="muted">
                    Start by creating an NFT collection that will serve as the
                    parent for your NFTs
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
