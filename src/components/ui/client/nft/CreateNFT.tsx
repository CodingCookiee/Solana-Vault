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
import { useCreateNFT, useImageUpload } from "@/services/nft/nft.hooks";
import { NFTDetails } from "@/services/nft/nft.types";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  FileImage,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Pen,
  Copy,
  ExternalLink,
  Image,
  Tag,
  FileText,
  Link,
  RefreshCw,
  ArrowRight,
  Award,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface CreateNFTProps {
  collectionMint?: string;
  onNFTCreated?: (nft: NFTDetails) => void;
}

export function CreateNFT({ collectionMint, onNFTCreated }: CreateNFTProps) {
  const { connected } = useWallet();
  const { create, loading: creating, error: createError } = useCreateNFT();
  const {
    upload,
    loading: uploading,
    error: uploadError,
    uploadMethod,
  } = useImageUpload();

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    collectionMintAddress: collectionMint || "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [createdNFT, setCreatedNFT] = useState<NFTDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const validateCollectionMint = (address: string): boolean => {
    if (!address.trim()) return true; // Optional field
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };
  // Compute form validation state
  const isFormValid =
    formData.name.trim() !== "" &&
    formData.symbol.trim() !== "" &&
    formData.description.trim() !== "" &&
    imageFile !== null &&
    (formData.collectionMintAddress === "" ||
      validateCollectionMint(formData.collectionMintAddress));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!imageFile) {
      toast.error("Please select an image for the NFT");
      return;
    }

    // Prevent double submission
    if (isSubmitting || creating || uploading) {
      toast.warning("Already processing request...");
      return;
    }

    // Validate collection mint address if provided
    if (
      formData.collectionMintAddress &&
      !validateCollectionMint(formData.collectionMintAddress)
    ) {
      toast.error("Invalid collection mint address format");
      return;
    }

    try {
      setIsSubmitting(true);
      setCurrentStep(1); // Start uploading

      // Upload image first
      const imageUri = await upload(imageFile);
      if (!imageUri) {
        throw new Error("Failed to upload image");
      }

      setCurrentStep(2); // Image uploaded, now creating NFT

      // Prepare collection mint
      let collectionMintKey: PublicKey | undefined;
      if (formData.collectionMintAddress.trim()) {
        try {
          collectionMintKey = new PublicKey(formData.collectionMintAddress);
        } catch (error) {
          console.warn(
            "Invalid collection mint address, creating NFT without collection"
          );
          collectionMintKey = undefined;
        }
      }

      // Create the NFT
      const nft = await create({
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        uri: imageUri,
        collectionMint: collectionMintKey,
      });

      if (nft) {
        setCreatedNFT(nft);
        onNFTCreated?.(nft);
        setCurrentStep(3); // NFT created successfully
        toast.success("NFT created successfully!");

        // Reset form for next creation
        setFormData({
          name: "",
          symbol: "",
          description: "",
          collectionMintAddress: collectionMint || "",
        });
        setImageFile(null);
        setImagePreview("");
      }
    } catch (error) {
      console.error("Error creating NFT:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to create NFT: " + errorMessage);
      setCurrentStep(0); // Reset to form input on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCreatedNFT(null);
    setCurrentStep(0);
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
              Please connect your wallet to create an NFT
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
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-pink-500"></div>

        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 shadow-sm">
              <Image className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>
                <Text
                  variant="h4"
                  className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent font-bold"
                >
                  Create NFT
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="small" color="muted">
                  Mint a unique NFT on Solana blockchain
                </Text>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {!createdNFT ? (
              <motion.div
                key="creation-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Progress Stepper */}
                <div className="mb-8">
                  <div className="relative flex justify-between items-center w-full">
                    {/* Progress Bar */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 -translate-y-1/2 transition-all duration-500 ease-in-out"
                      style={{ width: `${currentStep * 33.3}%` }}
                    ></div>

                    {/* Step 1: Input NFT Details */}
                    <div
                      className={`relative z-10 flex flex-col items-center ${
                        currentStep >= 0
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          currentStep >= 0
                            ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        }`}
                      >
                        <Pen className="h-5 w-5" />
                      </div>
                      <Text variant="small" weight="medium" className="mt-2">
                        Details
                      </Text>
                    </div>

                    {/* Step 2: Upload Image */}
                    <div
                      className={`relative z-10 flex flex-col items-center ${
                        currentStep >= 1
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          currentStep >= 1
                            ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        }`}
                      >
                        <Upload className="h-5 w-5" />
                      </div>
                      <Text variant="small" weight="medium" className="mt-2">
                        Upload
                      </Text>
                    </div>

                    {/* Step 3: Create NFT */}
                    <div
                      className={`relative z-10 flex flex-col items-center ${
                        currentStep >= 2
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          currentStep >= 2
                            ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        }`}
                      >
                        <Award className="h-5 w-5" />
                      </div>
                      <Text variant="small" weight="medium" className="mt-2">
                        Mint
                      </Text>
                    </div>

                    {/* Step 4: Success */}
                    <div
                      className={`relative z-10 flex flex-col items-center ${
                        currentStep >= 3
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          currentStep >= 3
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <Text variant="small" weight="medium" className="mt-2">
                        Success
                      </Text>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* NFT Details */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <label className="block text-sm font-medium">
                            NFT Name *
                          </label>
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          disabled={creating || uploading || isSubmitting}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 dark:bg-gray-800"
                          placeholder="My Awesome NFT"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <label className="block text-sm font-medium">
                            Symbol *
                          </label>
                        </div>
                        <input
                          type="text"
                          name="symbol"
                          value={formData.symbol}
                          onChange={handleInputChange}
                          required
                          disabled={creating || uploading || isSubmitting}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 dark:bg-gray-800"
                          placeholder="MAN"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <label className="block text-sm font-medium">
                            Description *
                          </label>
                        </div>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          rows={3}
                          disabled={creating || uploading || isSubmitting}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 dark:bg-gray-800 resize-none"
                          placeholder="A unique NFT..."
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Link className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <label className="block text-sm font-medium">
                            Collection Mint Address (Optional)
                          </label>
                        </div>
                        <input
                          type="text"
                          name="collectionMintAddress"
                          value={formData.collectionMintAddress}
                          onChange={handleInputChange}
                          disabled={
                            creating ||
                            uploading ||
                            isSubmitting ||
                            !!collectionMint
                          }
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 ${
                            formData.collectionMintAddress &&
                            !validateCollectionMint(
                              formData.collectionMintAddress
                            )
                              ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                              : formData.collectionMintAddress &&
                                validateCollectionMint(
                                  formData.collectionMintAddress
                                )
                              ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="Enter collection mint address (optional)"
                        />

                        <AnimatePresence>
                          {formData.collectionMintAddress &&
                            !validateCollectionMint(
                              formData.collectionMintAddress
                            ) && (
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

                          {collectionMint && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                                <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                                <Text
                                  variant="extraSmall"
                                  className="text-green-800 dark:text-green-200"
                                >
                                  NFT will be added to the selected collection
                                </Text>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <FileImage className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <label className="block text-sm font-medium">
                            NFT Image *
                          </label>
                        </div>

                        <div
                          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                            imagePreview
                              ? "border-indigo-300 dark:border-indigo-700"
                              : "border-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {imagePreview ? (
                            <div className="space-y-4">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-48 h-48 object-cover rounded-lg border mx-auto"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setImageFile(null);
                                  setImagePreview("");
                                }}
                                disabled={creating || uploading || isSubmitting}
                                className="mx-auto"
                              >
                                Change Image
                              </Button>
                            </div>
                          ) : (
                            <div className="py-8">
                              <FileImage className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                              <Text
                                variant="small"
                                color="muted"
                                align="center"
                                className="mb-4"
                              >
                                Drag and drop or click to upload
                              </Text>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={creating || uploading || isSubmitting}
                                onClick={() =>
                                  document.getElementById("nft-image")?.click()
                                }
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Select Image
                              </Button>
                            </div>
                          )}
                          <input
                            id="nft-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            required
                            disabled={creating || uploading || isSubmitting}
                            className="hidden"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                          <Text variant="extraSmall" color="muted">
                            Image will be uploaded to{" "}
                            {uploadMethod.toUpperCase()} storage
                          </Text>
                        </div>
                      </div>

                      {/* Storage Information */}
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-start space-x-2">
                          <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                          <Text
                            variant="extraSmall"
                            className="text-indigo-800 dark:text-indigo-200"
                          >
                            Your NFT image will be permanently stored and your
                            NFT will be a part of your Solana wallet.
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Display */}
                  <AnimatePresence>
                    {(createError || uploadError) && (
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
                              <Text
                                color="error"
                                variant="small"
                                weight="medium"
                              >
                                {createError || uploadError}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={
                      creating || uploading || isSubmitting || !isFormValid
                    }
                    className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow-lg group border-0 h-12"
                  >
                    {uploading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading Image...</span>
                      </div>
                    ) : creating || isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating NFT...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Image className="h-4 w-4" />
                        <span>Create NFT</span>
                        <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Success Card */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center mb-6">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>

                    <Text
                      variant="h3"
                      color="success"
                      weight="bold"
                      align="center"
                      className="mb-4"
                    >
                      NFT Created Successfully!
                    </Text>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Text variant="small" weight="medium" color="muted">
                          Mint Address
                        </Text>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                          <Text
                            variant="small"
                            className="font-mono break-all pr-2"
                          >
                            {createdNFT.mint.toString()}
                          </Text>
                          <div className="flex space-x-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(createdNFT.mint.toString())
                              }
                              className="h-7 w-7 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openInExplorer(createdNFT.mint.toString())
                              }
                              className="h-7 w-7 p-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                          <Text
                            variant="small"
                            weight="medium"
                            color="muted"
                            className="mb-1"
                          >
                            Name
                          </Text>
                          <Text variant="body" weight="semibold">
                            {createdNFT.name}
                          </Text>
                        </div>

                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                          <Text
                            variant="small"
                            weight="medium"
                            color="muted"
                            className="mb-1"
                          >
                            Symbol
                          </Text>
                          <Text variant="body" weight="semibold">
                            {createdNFT.symbol}
                          </Text>
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <Text
                          variant="small"
                          weight="medium"
                          color="muted"
                          className="mb-1"
                        >
                          Description
                        </Text>
                        <Text variant="small">{createdNFT.description}</Text>
                      </div>

                      {createdNFT.collection && (
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
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
                              className="font-mono break-all pr-2"
                            >
                              {createdNFT.collection.toString()}
                            </Text>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openInExplorer(
                                  createdNFT.collection!.toString()
                                )
                              }
                              className="h-7 w-7 p-0 shrink-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Create Another NFT
                  </Button>

                  <Button
                    onClick={() => openInExplorer(createdNFT.mint.toString())}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow-lg group border-0"
                  >
                    View on Explorer
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>
              Creating NFTs incurs network fees. Make sure you have enough SOL
              in your wallet.
            </span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
