"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/common/card";
import { Text } from "@/components/ui/common/text";
import { Button } from "@/components/ui/common/button";
import { useWalletNFTs } from "@/services/nft/nft.hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Gem,
  Folder,
  RefreshCw,
  Copy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  LayoutGrid,
  LayoutList,
  Image as ImageIcon,
  Search,
  Filter,
  SlidersHorizontal,
  FileImage,
  ImageOff,
  BadgeCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

export function MyNFTs() {
  const { connected } = useWallet();
  const { collections, nfts, loading, error, refresh } = useWalletNFTs();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<
    "all" | "collections" | "nfts"
  >("all");
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);

  // Filter NFTs and collections based on search query
  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNFTs = nfts.filter(
    (nft) =>
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine what items to display based on selected tab
  const displayedItems =
    selectedTab === "all"
      ? [...filteredCollections, ...filteredNFTs]
      : selectedTab === "collections"
      ? filteredCollections
      : filteredNFTs;

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const getNFTDetailsByMint = (mintAddress: string) => {
    return [...collections, ...nfts].find(
      (item) => item.mint.toString() === mintAddress
    );
  };

  if (!connected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border border-amber-200 dark:border-amber-800 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400"></div>
          <CardContent className="p-8 text-center">
            <div className="relative mx-auto w-fit mb-6">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-20 blur"></div>
              <div className="relative p-4 bg-amber-100/50 dark:bg-amber-900/30 rounded-full">
                <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <Text
              variant="h4"
              className="text-amber-800 dark:text-amber-200 font-bold mb-3"
            >
              Wallet Connection Required
            </Text>
            <Text variant="body" color="muted">
              Please connect your wallet to view your NFTs and collections
            </Text>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border border-blue-200 dark:border-blue-800 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
          <CardContent className="p-12 text-center">
            <div className="relative mx-auto w-fit mb-6">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur"></div>
              <div className="relative p-4 bg-blue-100/50 dark:bg-blue-900/30 rounded-full">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <Text
              variant="h4"
              className="text-blue-800 dark:text-blue-200 font-bold mb-3"
            >
              Loading Your NFTs
            </Text>
            <Text variant="body" color="muted">
              Fetching your NFTs and collections from the Solana blockchain...
            </Text>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border border-red-200 dark:border-red-800 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-400 to-pink-400"></div>
          <CardContent className="p-8 text-center">
            <div className="relative mx-auto w-fit mb-6">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-400 to-pink-400 opacity-20 blur"></div>
              <div className="relative p-4 bg-red-100/50 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <Text
              variant="h4"
              className="text-red-800 dark:text-red-200 font-bold mb-3"
            >
              Error Loading NFTs
            </Text>
            <Text variant="body" color="muted" className="mb-6">
              {error}
            </Text>
            <Button
              onClick={refresh}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Calculate total count
  const totalItems = collections.length + nfts.length;
  const verifiedCount = nfts.filter((nft) => nft.verified).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm">
                <Gem className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>
                  <Text
                    variant="h4"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold"
                  >
                    My Wallet NFTs & Collections
                  </Text>
                </CardTitle>
                <CardDescription>
                  <Text variant="small" color="muted">
                    Showing all NFTs and collections from your connected wallet
                  </Text>
                </CardDescription>
              </div>
            </div>

            <Button
              onClick={refresh}
              disabled={loading}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          {/* NFT Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
              <Text
                variant="h3"
                className="text-purple-600 dark:text-purple-400 font-bold"
              >
                {totalItems}
              </Text>
              <Text variant="small" color="muted">
                Total Items
              </Text>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
              <Text
                variant="h3"
                className="text-blue-600 dark:text-blue-400 font-bold"
              >
                {collections.length}
              </Text>
              <Text variant="small" color="muted">
                Collections
              </Text>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
              <Text
                variant="h3"
                className="text-green-600 dark:text-green-400 font-bold"
              >
                {nfts.length}
              </Text>
              <Text variant="small" color="muted">
                NFTs
              </Text>
            </div>
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
              <Text
                variant="h3"
                className="text-amber-600 dark:text-amber-400 font-bold"
              >
                {verifiedCount}
              </Text>
              <Text variant="small" color="muted">
                Verified
              </Text>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800"
                placeholder="Search by name or symbol..."
              />
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <div className="inline-flex p-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                <button
                  onClick={() => setSelectedTab("all")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    selectedTab === "all"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedTab("collections")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    selectedTab === "collections"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Collections
                </button>
                <button
                  onClick={() => setSelectedTab("nfts")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    selectedTab === "nfts"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  NFTs
                </button>
              </div>

              <div className="inline-flex p-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFTs and Collections Display */}
      <AnimatePresence mode="wait">
        {displayedItems.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="relative mx-auto w-fit mb-6">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 opacity-20 blur"></div>
                  <div className="relative p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <ImageOff className="h-8 w-8 text-gray-500" />
                  </div>
                </div>
                <Text
                  variant="h4"
                  color="muted"
                  weight="medium"
                  className="mb-3"
                >
                  {searchQuery
                    ? "No results found"
                    : selectedTab === "collections"
                    ? "No collections found"
                    : selectedTab === "nfts"
                    ? "No NFTs found"
                    : "No items found"}
                </Text>
                <Text
                  variant="body"
                  color="muted"
                  className="mb-6 max-w-md mx-auto"
                >
                  {searchQuery
                    ? `No items matching "${searchQuery}" were found. Try a different search term.`
                    : "It looks like there are no items in your wallet."}
                </Text>
                {searchQuery && (
                  <Button onClick={() => setSearchQuery("")} variant="outline">
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
              <CardContent className="p-6">
                <AnimatePresence>
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        : "space-y-4"
                    }
                  >
                    {displayedItems.map((item, index) => {
                      const isCollection =
                        "symbol" in item && !("verified" in item);
                      const isNFT = "verified" in item;

                      return (
                        <motion.div
                          key={item.mint.toString()}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          layoutId={item.mint.toString()}
                          onClick={() => setSelectedNFT(item.mint.toString())}
                          className={`border ${
                            selectedNFT === item.mint.toString()
                              ? "border-purple-500 dark:border-purple-400 shadow-md"
                              : "border-gray-200 dark:border-gray-700"
                          } rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer`}
                        >
                          {viewMode === "grid" ? (
                            // Grid View
                            <div className="flex flex-col h-full">
                              <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        "https://placehold.co/400x400/eeeeee/cccccc?text=No+Image";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FileImage className="h-12 w-12 text-gray-400" />
                                  </div>
                                )}
                                {isCollection && (
                                  <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-1 rounded-md shadow-md">
                                    Collection
                                  </div>
                                )}
                                {isNFT && (
                                  <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-md shadow-md">
                                    NFT
                                  </div>
                                )}
                                {isNFT && (item as any).verified && (
                                  <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1 shadow-md">
                                    <BadgeCheck className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>

                              <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                  <Text
                                    variant="small"
                                    weight="bold"
                                    className="truncate mb-1"
                                  >
                                    {item.name}
                                  </Text>
                                  <Text
                                    variant="extraSmall"
                                    color="muted"
                                    className="line-clamp-2 h-9"
                                  >
                                    {item.description || "No description"}
                                  </Text>
                                </div>

                                <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center justify-between">
                                    <Text variant="extraSmall" color="muted">
                                      {isCollection ? "Collection" : "NFT"}
                                    </Text>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copyToClipboard(item.mint.toString());
                                        }}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openInExplorer(item.mint.toString());
                                        }}
                                        className="h-6 w-6 p-0"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // List View
                            <div className="p-4 flex gap-4">
                              <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        "https://placehold.co/400x400/eeeeee/cccccc?text=No+Image";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FileImage className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                                {isNFT && (item as any).verified && (
                                  <div className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-0.5 shadow-md">
                                    <BadgeCheck className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 overflow-hidden">
                                <div className="flex items-center gap-2 mb-1">
                                  <Text
                                    variant="small"
                                    weight="bold"
                                    className="truncate"
                                  >
                                    {item.name}
                                  </Text>
                                  <div
                                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                                      isCollection
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                        : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                    }`}
                                  >
                                    {isCollection ? "Collection" : "NFT"}
                                  </div>
                                </div>

                                <Text
                                  variant="extraSmall"
                                  color="muted"
                                  className="truncate mb-2"
                                >
                                  {item.symbol}
                                </Text>

                                <div className="flex items-center justify-between">
                                  <Text
                                    variant="extraSmall"
                                    color="muted"
                                    className="font-mono truncate pr-2"
                                  >
                                    {item.mint.toString().substring(0, 12)}...
                                  </Text>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(item.mint.toString());
                                      }}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openInExplorer(item.mint.toString());
                                      }}
                                      className="h-6 w-6 p-0"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>
              </CardContent>

              <CardFooter className="border-t border-gray-200 dark:border-gray-700 py-3 px-6 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 w-full justify-between">
                  <span>
                    Showing {displayedItems.length} of{" "}
                    {selectedTab === "all"
                      ? totalItems
                      : selectedTab === "collections"
                      ? collections.length
                      : nfts.length}{" "}
                    items
                  </span>
                  <div className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    <span>Updated {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NFT Detail Modal */}
      <AnimatePresence>
        {selectedNFT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNFT(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
              layoutId={`detail-${selectedNFT}`}
            >
              {(() => {
                const item = getNFTDetailsByMint(selectedNFT);
                if (!item) return null;

                const isCollection = "symbol" in item && !("verified" in item);
                const isNFT = "verified" in item;

                return (
                  <>
                    <div className="relative">
                      <div className="h-48 bg-gray-100 dark:bg-gray-800 relative">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/800x400/eeeeee/cccccc?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileImage className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedNFT(null)}
                          className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {isCollection && (
                          <div className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full shadow-md">
                            Collection
                          </div>
                        )}
                        {isNFT && (
                          <div className="absolute bottom-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full shadow-md">
                            NFT
                          </div>
                        )}
                        {isNFT && (item as any).verified && (
                          <div className="absolute bottom-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full shadow-md flex items-center space-x-1">
                            <BadgeCheck className="h-4 w-4" />
                            <span>Verified</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-6">
                        <Text variant="h3" weight="bold" className="mb-1">
                          {item.name}
                        </Text>
                        <Text variant="small" color="muted" className="mb-3">
                          {item.symbol}
                        </Text>
                        <Text variant="body">
                          {item.description ||
                            "No description available for this item."}
                        </Text>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-700">
                          <Text
                            variant="small"
                            weight="medium"
                            color="muted"
                            className="mb-1"
                          >
                            Mint Address
                          </Text>
                          <div className="flex items-center justify-between">
                            <Text
                              variant="small"
                              className="font-mono truncate pr-2"
                            >
                              {item.mint.toString()}
                            </Text>
                            <div className="flex space-x-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(item.mint.toString())
                                }
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  openInExplorer(item.mint.toString())
                                }
                                className="h-6 w-6 p-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {isNFT && (item as any).collection && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-700">
                            <Text
                              variant="small"
                              weight="medium"
                              color="muted"
                              className="mb-1"
                            >
                              Collection
                            </Text>
                            <div className="flex items-center justify-between">
                              <Text
                                variant="small"
                                className="font-mono truncate pr-2"
                              >
                                {(item as any).collection.toString()}
                              </Text>
                              <div className="flex space-x-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(
                                      (item as any).collection.toString()
                                    )
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    openInExplorer(
                                      (item as any).collection.toString()
                                    )
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedNFT(null)}
                        >
                          Close
                        </Button>
                        <Button
                          onClick={() => openInExplorer(item.mint.toString())}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
                        >
                          View on Explorer
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
