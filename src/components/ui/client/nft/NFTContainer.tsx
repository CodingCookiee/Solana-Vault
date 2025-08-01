"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/common/card";
import { Button } from "@/components/ui/common/button";
import { Text } from "@/components/ui/common/text";
import { CreateCollection } from "./CreateCollection";
import { CreateNFT } from "./CreateNFT";
import { VerifyNFT } from "./VerifyNFT";
import { MyNFTs } from "./MyNFTs";
import { CollectionDetails, NFTDetails } from "@/services/nft/nft.types";
import { useWalletNFTs } from "@/services/nft/nft.hooks";
import {
  Palette,
  FolderPlus,
  ImagePlus,
  BadgeCheck,
  Gem,
  ExternalLink,
  Copy,
  CheckCircle2,
  ArrowRight,
  Info,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type ActiveTab = "collection" | "nft" | "verify" | "my-nfts";

export function NFTContainer() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("my-nfts");
  const [createdCollection, setCreatedCollection] =
    useState<CollectionDetails | null>(null);
  const [createdNFT, setCreatedNFT] = useState<NFTDetails | null>(null);

  // Get wallet NFTs for recent activity display
  const { refresh: refreshWalletNFTs } = useWalletNFTs();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  const openInExplorer = (address: string) => {
    window.open(
      `https://explorer.solana.com/address/${address}?cluster=devnet`,
      "_blank"
    );
  };

  const tabs = [
    {
      id: "my-nfts" as ActiveTab,
      label: "My NFTs",
      icon: <Gem className="h-4 w-4" />,
      description: "View and manage your NFTs and collections",
      color: "from-purple-500 to-pink-500",
      gradient: "from-purple-600 to-pink-600",
    },
    {
      id: "collection" as ActiveTab,
      label: "Create Collection",
      icon: <FolderPlus className="h-4 w-4" />,
      description: "Create a new NFT collection",
      color: "from-indigo-500 to-blue-500",
      gradient: "from-indigo-600 to-blue-600",
    },
    {
      id: "nft" as ActiveTab,
      label: "Create NFT",
      icon: <ImagePlus className="h-4 w-4" />,
      description: "Mint a new NFT with optional collection",
      color: "from-green-500 to-emerald-500",
      gradient: "from-green-600 to-emerald-600",
    },
    {
      id: "verify" as ActiveTab,
      label: "Verify NFT",
      icon: <BadgeCheck className="h-4 w-4" />,
      description: "Verify NFT membership in collection",
      color: "from-amber-500 to-orange-500",
      gradient: "from-amber-600 to-orange-600",
    },
  ];

  const handleCollectionCreated = async (collection: CollectionDetails) => {
    setCreatedCollection(collection);
    setActiveTab("nft");
    toast.success(
      "Collection created! You can now create an NFT for this collection.",
      {
        duration: 5000,
      }
    );

    // Refresh wallet data to show the new collection
    setTimeout(() => {
      refreshWalletNFTs();
    }, 2000); // Give some time for the transaction to confirm
  };

  const handleNFTCreated = async (nft: NFTDetails) => {
    setCreatedNFT(nft);

    if (nft.collection) {
      setActiveTab("verify");
      toast.success("NFT created! You can now verify it in the collection.", {
        duration: 5000,
      });
    } else {
      toast.success("NFT created successfully!", {
        duration: 5000,
      });
    }

    // Refresh wallet data to show the new NFT
    setTimeout(() => {
      refreshWalletNFTs();
    }, 2000); // Give some time for the transaction to confirm
  };

  // Find the active tab
  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto space-y-8"
    >
      {/* Header Card */}
      <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>

        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 shadow-sm">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>
                <Text
                  variant="h3"
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent font-bold"
                >
                  Solana NFT Studio
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="body" color="muted">
                  Create collections, mint NFTs, verify authenticity, and manage
                  your digital assets
                </Text>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Recent Activity Card */}
      <AnimatePresence>
        {(createdCollection || createdNFT) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400"></div>

              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle>
                    <Text
                      variant="h6"
                      className="text-green-600 dark:text-green-400 font-bold"
                    >
                      Recent Activity
                    </Text>
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {createdCollection && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-800/50 mt-0.5">
                        <FolderPlus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <Text
                            variant="small"
                            weight="semibold"
                            className="mr-2 truncate"
                          >
                            {createdCollection.name}
                          </Text>
                          <Text
                            variant="extraSmall"
                            className="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full"
                          >
                            Collection
                          </Text>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Text
                            variant="extraSmall"
                            className="font-mono truncate flex-1"
                          >
                            {createdCollection.mint.toString()}
                          </Text>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(createdCollection.mint.toString())
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              openInExplorer(createdCollection.mint.toString())
                            }
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Text variant="extraSmall" color="muted">
                        Collection created successfully! It will appear in "My
                        NFTs" shortly.
                      </Text>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("nft")}
                        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                      >
                        <ImagePlus className="h-3 w-3 mr-2" />
                        Create NFT in this Collection
                        <ChevronRight className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {createdNFT && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-800/50 mt-0.5">
                        <ImagePlus className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <Text
                            variant="small"
                            weight="semibold"
                            className="mr-2 truncate"
                          >
                            {createdNFT.name}
                          </Text>
                          <Text
                            variant="extraSmall"
                            className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full"
                          >
                            NFT
                          </Text>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Text
                            variant="extraSmall"
                            className="font-mono truncate flex-1"
                          >
                            {createdNFT.mint.toString()}
                          </Text>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(createdNFT.mint.toString())
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              openInExplorer(createdNFT.mint.toString())
                            }
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      {createdNFT.collection && (
                        <div className="flex items-center mt-1">
                          <Text variant="extraSmall" color="muted">
                            In collection:
                          </Text>
                          <Text
                            variant="extraSmall"
                            className="font-mono ml-2 truncate"
                          >
                            {createdNFT.collection.toString().slice(0, 8)}...
                          </Text>
                        </div>
                      )}
                      <Text variant="extraSmall" color="muted">
                        NFT created successfully! It will appear in "My NFTs"
                        shortly.
                      </Text>
                    </div>
                    {createdNFT.collection && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("verify")}
                          className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                        >
                          <BadgeCheck className="h-3 w-3 mr-2" />
                          Verify in Collection
                          <ChevronRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation Card */}
      <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto scrollbar-none pt-4 px-4">
            {tabs.map((tab) => {
              // Dynamic classes based on active state
              const isActive = activeTab === tab.id;

              // Determine tab colors based on ID
              let bgGradient, textColor, borderColor, hoverClasses;

              if (tab.id === "my-nfts") {
                bgGradient = isActive
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-gray-200 dark:bg-gray-700";
                textColor = isActive
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-400";
                borderColor = isActive
                  ? "border-purple-500"
                  : "border-transparent";
                hoverClasses = isActive
                  ? ""
                  : "hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50";
              } else if (tab.id === "collection") {
                bgGradient = isActive
                  ? "bg-gradient-to-r from-indigo-500 to-blue-500"
                  : "bg-gray-200 dark:bg-gray-700";
                textColor = isActive
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-400";
                borderColor = isActive
                  ? "border-indigo-500"
                  : "border-transparent";
                hoverClasses = isActive
                  ? ""
                  : "hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50";
              } else if (tab.id === "nft") {
                bgGradient = isActive
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gray-200 dark:bg-gray-700";
                textColor = isActive
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-400";
                borderColor = isActive
                  ? "border-green-500"
                  : "border-transparent";
                hoverClasses = isActive
                  ? ""
                  : "hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50";
              } else if (tab.id === "verify") {
                bgGradient = isActive
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gray-200 dark:bg-gray-700";
                textColor = isActive
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-400";
                borderColor = isActive
                  ? "border-amber-500"
                  : "border-transparent";
                hoverClasses = isActive
                  ? ""
                  : "hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50";
              }

              return (
                <div
                  key={tab.id}
                  className={`relative flex-1 min-w-[120px] pb-4 cursor-pointer ${hoverClasses}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 mb-2 flex items-center justify-center rounded-lg shadow-md ${bgGradient} ${textColor}`}
                    >
                      {tab.icon}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive
                          ? `text-${tab.gradient
                              .split(" ")[0]
                              .replace("from-", "")}`
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </div>
                  {/* Bottom border indicator */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 ${
                      isActive ? bgGradient : "bg-transparent"
                    }`}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Tab Description */}
        {activeTabData && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Text variant="small" color="muted">
                {activeTabData.description}
              </Text>
            </div>
          </div>
        )}
      </Card>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === "my-nfts" && (
            <motion.div
              key="my-nfts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MyNFTs />
            </motion.div>
          )}

          {activeTab === "collection" && (
            <motion.div
              key="collection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CreateCollection onCollectionCreated={handleCollectionCreated} />
            </motion.div>
          )}

          {activeTab === "nft" && (
            <motion.div
              key="nft"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CreateNFT
                collectionMint={createdCollection?.mint.toString()}
                onNFTCreated={handleNFTCreated}
              />
            </motion.div>
          )}

          {activeTab === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <VerifyNFT />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* How It Works Card */}
      <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"></div>

        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 shadow-sm">
              <HelpCircle className="h-5 w-5 text-white" />
            </div>
            <CardTitle>
              <Text
                variant="h5"
                className="text-gray-700 dark:text-gray-300 font-bold"
              >
                How It Works
              </Text>
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <Text variant="small" color="muted" className="mb-6">
            All your NFTs and collections are fetched directly from your wallet.
            No data is stored locally on this webpage.
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="relative">
              <div className="absolute top-0 left-6 h-full border-l-2 border-dashed border-gray-300 dark:border-gray-600 z-0"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-lg">
                  1
                </div>
                <div className="space-y-2 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 p-4 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                  <Text
                    variant="small"
                    weight="semibold"
                    className="text-indigo-700 dark:text-indigo-300"
                  >
                    Create Collection
                  </Text>
                  <Text variant="small" color="muted">
                    Start by creating an NFT collection that will serve as the
                    parent for your NFTs. Collections help organize and verify
                    your digital assets.
                  </Text>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("collection")}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20 mt-2"
                  >
                    <FolderPlus className="h-3 w-3 mr-2" />
                    Create Collection
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 left-6 h-full border-l-2 border-dashed border-gray-300 dark:border-gray-600 z-0"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-lg">
                  2
                </div>
                <div className="space-y-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-4 rounded-lg border border-green-200/50 dark:border-green-800/50">
                  <Text
                    variant="small"
                    weight="semibold"
                    className="text-green-700 dark:text-green-300"
                  >
                    Create NFT
                  </Text>
                  <Text variant="small" color="muted">
                    Mint an NFT and assign it to your collection. You can upload
                    an image and define metadata for your digital asset.
                  </Text>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("nft")}
                    className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20 mt-2"
                  >
                    <ImagePlus className="h-3 w-3 mr-2" />
                    Create NFT
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-lg">
                  3
                </div>
                <div className="space-y-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-4 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                  <Text
                    variant="small"
                    weight="semibold"
                    className="text-amber-700 dark:text-amber-300"
                  >
                    Verify NFT
                  </Text>
                  <Text variant="small" color="muted">
                    Verify that your NFT belongs to the collection to establish
                    authenticity. This creates a cryptographic proof of
                    membership.
                  </Text>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("verify")}
                    className="border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20 mt-2"
                  >
                    <BadgeCheck className="h-3 w-3 mr-2" />
                    Verify NFT
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Info className="h-3 w-3 mr-1" />
            <span>
              Creating NFTs and collections incurs network fees. Make sure you
              have enough SOL in your wallet.
            </span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
