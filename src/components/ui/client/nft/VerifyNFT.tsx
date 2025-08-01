"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PublicKey } from "@solana/web3.js";
import { Button } from "@/components/ui/common/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/common/card";
import { Text } from "@/components/ui/common/text";
import { useVerifyNFT, useNFTDetails } from "@/services/nft/nft.hooks";
import { NFTDetails } from "@/services/nft/nft.types";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  BadgeCheck,
  Copy,
  ExternalLink,
  FileImage,
  ArrowRight,
  PictureInPicture,
} from "lucide-react";
import { toast } from "sonner";

export function VerifyNFT() {
  const { connected, publicKey } = useWallet();
  const { verify, loading: verifying, error: verifyError } = useVerifyNFT();
  const {
    fetchDetails,
    loading: fetching,
    error: fetchError,
  } = useNFTDetails();

  const [formData, setFormData] = useState({
    nftMint: "",
    collectionMint: "",
  });
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePublicKey = (address: string): boolean => {
    if (!address.trim()) return false;
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const openInExplorer = (address: string) => {
    window.open(
      `https://explorer.solana.com/address/${address}?cluster=devnet`,
      "_blank"
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset verification success when inputs change
    if (verificationSuccess) {
      setVerificationSuccess(false);
    }
  };

  const handleFetchDetails = async () => {
    if (!formData.nftMint) {
      toast.error("Please enter an NFT mint address");
      return;
    }

    if (!validatePublicKey(formData.nftMint)) {
      toast.error("Please enter a valid NFT mint address");
      return;
    }

    try {
      toast.info("Fetching NFT details...");
      const details = await fetchDetails(formData.nftMint);
      setNftDetails(details);
      toast.success("NFT details loaded successfully");

      if (details?.collection) {
        // Auto-fill collection mint if NFT has a collection
        setFormData((prev) => ({
          ...prev,
          collectionMint: details.collection?.toString() || prev.collectionMint,
        }));
      }
    } catch (error) {
      console.error("Error fetching NFT details:", error);
      toast.error("Failed to fetch NFT details");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.nftMint || !formData.collectionMint) {
      toast.error("Please enter both NFT and Collection mint addresses");
      return;
    }

    if (!validatePublicKey(formData.nftMint)) {
      toast.error("Please enter a valid NFT mint address");
      return;
    }

    if (!validatePublicKey(formData.collectionMint)) {
      toast.error("Please enter a valid Collection mint address");
      return;
    }

    // Prevent double submission
    if (isSubmitting || verifying || fetching) {
      toast.warning("Already processing a request...");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.info("Starting verification process...");

      const nftMint = new PublicKey(formData.nftMint);
      const collectionMint = new PublicKey(formData.collectionMint);

      console.log("Starting verification process...");
      const success = await verify({
        nftMint,
        collectionMint,
        creator: publicKey,
      });

      if (success) {
        setVerificationSuccess(true);
        toast.success("NFT verification successful!");
        console.log("Verification successful, refreshing NFT details...");

        // Refresh NFT details after verification
        const updatedDetails = await fetchDetails(formData.nftMint);
        setNftDetails(updatedDetails);
      }
    } catch (error) {
      console.error("Error verifying NFT:", error);
      toast.error("Error verifying NFT. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
              Please connect your wallet to verify NFTs
            </Text>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>
                <Text
                  variant="h4"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold"
                >
                  Verify NFT in Collection
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="small" color="muted">
                  Verify that an NFT belongs to a specific collection to
                  establish authenticity
                </Text>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <PictureInPicture className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <label className="block text-sm font-medium">
                  NFT Mint Address *
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="nftMint"
                  value={formData.nftMint}
                  onChange={handleInputChange}
                  required
                  disabled={verifying || fetching || isSubmitting}
                  className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 dark:bg-gray-800 ${
                    formData.nftMint && !validatePublicKey(formData.nftMint)
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                      : formData.nftMint && validatePublicKey(formData.nftMint)
                      ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Enter NFT mint address"
                />
                <Button
                  type="button"
                  onClick={handleFetchDetails}
                  disabled={
                    fetching ||
                    !formData.nftMint ||
                    !validatePublicKey(formData.nftMint) ||
                    verifying ||
                    isSubmitting
                  }
                  variant="outline"
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                >
                  {fetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2">Fetch</span>
                </Button>
              </div>

              <AnimatePresence>
                {formData.nftMint && !validatePublicKey(formData.nftMint) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                      <Text
                        variant="extraSmall"
                        className="text-red-800 dark:text-red-200"
                      >
                        Invalid NFT mint address format
                      </Text>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <label className="block text-sm font-medium">
                  Collection Mint Address *
                </label>
              </div>
              <input
                type="text"
                name="collectionMint"
                value={formData.collectionMint}
                onChange={handleInputChange}
                required
                disabled={verifying || fetching || isSubmitting}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 dark:bg-gray-800 ${
                  formData.collectionMint &&
                  !validatePublicKey(formData.collectionMint)
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                    : formData.collectionMint &&
                      validatePublicKey(formData.collectionMint)
                    ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter collection mint address"
              />

              <AnimatePresence>
                {formData.collectionMint &&
                  !validatePublicKey(formData.collectionMint) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                        <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                        <Text
                          variant="extraSmall"
                          className="text-red-800 dark:text-red-200"
                        >
                          Invalid collection mint address format
                        </Text>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {(verifyError || fetchError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div className="space-y-2">
                        <Text color="error" variant="small" weight="medium">
                          {verifyError || fetchError}
                        </Text>

                        {(verifyError?.includes("already been processed") ||
                          verifyError?.includes("already in progress")) && (
                          <Text variant="extraSmall" color="muted">
                            Please check the verification status and refresh if
                            the NFT was verified successfully
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verification Success */}
            <AnimatePresence>
              {verificationSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <Text color="success" weight="medium">
                        NFT verified successfully in collection!
                      </Text>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={
                verifying ||
                fetching ||
                isSubmitting ||
                !validatePublicKey(formData.nftMint) ||
                !validatePublicKey(formData.collectionMint)
              }
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg group border-0 h-12"
            >
              {verifying || isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <BadgeCheck className="h-4 w-4" />
                  <span>Verify NFT in Collection</span>
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </form>

          {/* NFT Details */}
          <AnimatePresence>
            {nftDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600"></div>
                  <CardContent className="p-5">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 shadow-sm">
                        <FileImage className="h-5 w-5 text-white dark:text-gray-200" />
                      </div>
                      <Text variant="h5" weight="semibold">
                        NFT Details
                      </Text>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-700">
                          <Text
                            variant="small"
                            weight="medium"
                            color="muted"
                            className="mb-1"
                          >
                            Name
                          </Text>
                          <Text variant="body" weight="semibold">
                            {nftDetails.name}
                          </Text>
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-700">
                          <Text
                            variant="small"
                            weight="medium"
                            color="muted"
                            className="mb-1"
                          >
                            Symbol
                          </Text>
                          <Text variant="body" weight="semibold">
                            {nftDetails.symbol}
                          </Text>
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-700">
                          <Text
                            variant="small"
                            weight="medium"
                            color="muted"
                            className="mb-1"
                          >
                            Description
                          </Text>
                          <Text variant="small">
                            {nftDetails.description || "No description"}
                          </Text>
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-700 relative">
                          <Text
                            variant="small"
                            weight="medium"
                            color="muted"
                            className="mb-1"
                          >
                            Verification Status
                          </Text>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                nftDetails.verified
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              } ${nftDetails.verified ? "animate-pulse" : ""}`}
                            ></div>
                            <Text
                              variant="small"
                              weight="semibold"
                              className={
                                nftDetails.verified
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }
                            >
                              {nftDetails.verified
                                ? "Verified"
                                : "Not Verified"}
                            </Text>
                          </div>
                          {nftDetails.verified && (
                            <div className="absolute -top-2 -right-2 p-1 bg-green-500 rounded-full text-white">
                              <BadgeCheck className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {nftDetails.collection && (
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
                                {nftDetails.collection.toString()}
                              </Text>
                              <div className="flex space-x-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(
                                      nftDetails.collection.toString()
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
                                      nftDetails.collection.toString()
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

                        <div className="p-3 bg-gray-50 dark:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-700">
                          <Text
                            variant="small"
                            weight="medium"
                            color="muted"
                            className="mb-1"
                          >
                            Creator
                          </Text>
                          <div className="flex items-center justify-between">
                            <Text
                              variant="small"
                              className="font-mono truncate pr-2"
                            >
                              {nftDetails.creator.toString()}
                            </Text>
                            <div className="flex space-x-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(nftDetails.creator.toString())
                                }
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  openInExplorer(nftDetails.creator.toString())
                                }
                                className="h-6 w-6 p-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* NFT Image */}
                        {nftDetails.uri && (
                          <div className="relative overflow-hidden aspect-square rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <img
                              src={nftDetails.uri}
                              alt={nftDetails.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                              <Text
                                variant="small"
                                weight="medium"
                                className="text-white"
                              >
                                {nftDetails.name}
                              </Text>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>
              Verifying NFTs incurs network fees. Make sure you have enough SOL
              in your wallet.
            </span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
