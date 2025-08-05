"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { useCreateCollection, useImageUpload } from "@/services/nft/nft.hooks";
import { CollectionDetails } from "@/services/nft/nft.types";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  FileImage,
  Package,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Pen,
  Database,
  RefreshCw,
  Copy,
  ExternalLink,
  ArrowRight,
  PenTool,
  CloudUpload,
  CloudCog,
  Text as TextIcon,
  Hash,
  Radio,
} from "lucide-react";
import { toast } from "sonner";

interface CreateCollectionProps {
  onCollectionCreated?: (collection: CollectionDetails) => void;
}

export function CreateCollection({
  onCollectionCreated,
}: CreateCollectionProps) {
  const { connected } = useWallet();
  const {
    create,
    loading: creating,
    error: createError,
  } = useCreateCollection();
  const {
    upload,
    loading: uploading,
    error: uploadError,
    uploadMethod,
    setUploadMethod,
  } = useImageUpload();

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [createdCollection, setCreatedCollection] =
    useState<CollectionDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Compute form validation state
  const isFormValid =
    formData.name.trim() !== "" &&
    formData.symbol.trim() !== "" &&
    formData.description.trim() !== "" &&
    imageFile !== null;

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
      toast.error("Please select an image for the collection");
      return;
    }

    // Prevent double submission
    if (isSubmitting || creating || uploading) {
      toast.warning("Already processing request...");
      return;
    }

    try {
      setIsSubmitting(true);
      setCurrentStep(1); // Start uploading

      // Upload image first
      // console.log(`Starting image upload via ${uploadMethod}...`);
      const imageUri = await upload(imageFile);

      if (!imageUri) {
        console.error("Image upload failed - no URI returned");
        throw new Error("Failed to upload image - storage upload failed");
      }

      // console.log("Image uploaded successfully:", String(imageUri));
      setCurrentStep(2); // Image uploaded, now creating collection

      // // Create the collection
      // console.log("Creating collection...");
      const collection = await create({
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        uri: String(imageUri),
      });

      if (collection) {
        // console.log("Collection created successfully:", collection);
        setCreatedCollection(collection);
        onCollectionCreated?.(collection);
        setCurrentStep(3); // Collection created successfully
        toast.success("Collection created successfully!");

        // Reset form state for next creation
        setFormData({ name: "", symbol: "", description: "" });
        setImageFile(null);
        setImagePreview("");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      // console.log(`Error: ${errorMessage}`);
      toast.error(errorMessage);
      setCurrentStep(0); // Reset to form input on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCreatedCollection(null);
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
              Please connect your wallet to create an NFT collection
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
        <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>

        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 shadow-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>
                <Text
                  variant="h4"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold"
                >
                  Create NFT Collection
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="small" color="muted">
                  Deploy a new NFT collection on Solana with custom metadata
                </Text>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {!createdCollection ? (
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
                      className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 -translate-y-1/2 transition-all duration-500 ease-in-out"
                      style={{ width: `${currentStep * 33.3}%` }}
                    ></div>

                    {/* Step 1: Input Collection Details */}
                    <div
                      className={`relative z-10 flex flex-col items-center ${
                        currentStep >= 0
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          currentStep >= 0
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
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
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          currentStep >= 1
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        }`}
                      >
                        <Upload className="h-5 w-5" />
                      </div>
                      <Text variant="small" weight="medium" className="mt-2">
                        Upload
                      </Text>
                    </div>

                    {/* Step 3: Create Collection */}
                    <div
                      className={`relative z-10 flex flex-col items-center ${
                        currentStep >= 2
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          currentStep >= 2
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        }`}
                      >
                        <Database className="h-5 w-5" />
                      </div>
                      <Text variant="small" weight="medium" className="mt-2">
                        Create
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
                  {/* Upload Method Selector */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center space-x-2 mb-3">
                      <CloudCog className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <Text
                        variant="small"
                        weight="medium"
                        className="text-blue-800 dark:text-blue-200"
                      >
                        Storage Method
                      </Text>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                      <label
                        className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                          uploadMethod === "ipfs"
                            ? "bg-blue-100/50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200"
                            : "border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          value="ipfs"
                          checked={uploadMethod === "ipfs"}
                          onChange={() => setUploadMethod("ipfs")}
                          className="sr-only"
                          disabled={creating || uploading || isSubmitting}
                        />
                        <Radio
                          className={`h-5 w-5 mr-3 ${
                            uploadMethod === "ipfs"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-400"
                          }`}
                        />
                        <div>
                          <Text variant="small" weight="medium">
                            IPFS (Pinata)
                          </Text>
                          <Text variant="extraSmall" color="muted">
                            Fast distributed storage
                          </Text>
                        </div>
                      </label>

                      <label
                        className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                          uploadMethod === "arweave"
                            ? "bg-purple-100/50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200"
                            : "border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          value="arweave"
                          checked={uploadMethod === "arweave"}
                          onChange={() => setUploadMethod("arweave")}
                          className="sr-only"
                          disabled={creating || uploading || isSubmitting}
                        />
                        <Radio
                          className={`h-5 w-5 mr-3 ${
                            uploadMethod === "arweave"
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-gray-400"
                          }`}
                        />
                        <div>
                          <Text variant="small" weight="medium">
                            Arweave (Irys)
                          </Text>
                          <Text variant="extraSmall" color="muted">
                            Permanent blockchain storage
                          </Text>
                        </div>
                      </label>
                    </div>

                    <Text variant="extraSmall" color="muted">
                      IPFS provides faster uploads while Arweave offers
                      permanent storage
                    </Text>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Collection Details */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <TextIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <label className="block text-sm font-medium">
                            Collection Name *
                          </label>
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          disabled={creating || uploading || isSubmitting}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 dark:bg-gray-800"
                          placeholder="My Awesome Collection"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
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
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 dark:bg-gray-800"
                          placeholder="MAC"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <TextIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <label className="block text-sm font-medium">
                            Description *
                          </label>
                        </div>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          rows={4}
                          disabled={creating || uploading || isSubmitting}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 dark:bg-gray-800 resize-none"
                          placeholder="A unique collection of..."
                        />
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <FileImage className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <label
                            className="block text-sm font-medium"
                            htmlFor="collection-image"
                          >
                            Collection Image *
                          </label>
                        </div>

                        <div
                          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                            imagePreview
                              ? "border-purple-300 dark:border-purple-700"
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
                                  document
                                    .getElementById("collection-image")
                                    ?.click()
                                }
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Select Image
                              </Button>
                            </div>
                          )}
                          <input
                            id="collection-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            required
                            disabled={creating || uploading || isSubmitting}
                            className="hidden"
                          />
                        </div>

                        <Text variant="extraSmall" color="muted">
                          Recommended: Square image (1:1 ratio), min 500x500px,
                          PNG or JPG format
                        </Text>
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

                              {uploadMethod === "arweave" && uploadError && (
                                <Text variant="extraSmall" color="muted">
                                  Try switching to IPFS for more reliable
                                  uploads
                                </Text>
                              )}

                              {(createError?.includes(
                                "already been processed"
                              ) ||
                                createError?.includes(
                                  "already in progress"
                                )) && (
                                <Text variant="extraSmall" color="muted">
                                  Please check your wallet and refresh the page
                                  if the collection was created successfully
                                </Text>
                              )}
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
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg group border-0 h-12"
                  >
                    {uploading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          Uploading Image to {uploadMethod.toUpperCase()}...
                        </span>
                      </div>
                    ) : creating || isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating Collection...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>Create Collection</span>
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
                      Collection Created Successfully!
                    </Text>

                    <div className="grid gap-4 sm:grid-cols-2 mb-4">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <Text
                          variant="small"
                          weight="medium"
                          color="muted"
                          className="mb-1"
                        >
                          Collection Name
                        </Text>
                        <Text variant="body" weight="semibold">
                          {createdCollection.name}
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
                          {createdCollection.symbol}
                        </Text>
                      </div>
                    </div>

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
                            {createdCollection.mint.toString()}
                          </Text>
                          <div className="flex space-x-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  createdCollection.mint.toString()
                                )
                              }
                              className="h-7 w-7 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openInExplorer(
                                  createdCollection.mint.toString()
                                )
                              }
                              className="h-7 w-7 p-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Text variant="small" weight="medium" color="muted">
                          Creator Address
                        </Text>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                          <Text
                            variant="small"
                            className="font-mono break-all pr-2"
                          >
                            {createdCollection.creator.toString()}
                          </Text>
                          <div className="flex space-x-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  createdCollection.creator.toString()
                                )
                              }
                              className="h-7 w-7 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openInExplorer(
                                  createdCollection.creator.toString()
                                )
                              }
                              className="h-7 w-7 p-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
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
                    Create Another Collection
                  </Button>

                  <Button
                    onClick={() =>
                      openInExplorer(createdCollection.mint.toString())
                    }
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg group border-0"
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
              Creating NFT collections incurs network fees. Make sure you have
              enough SOL in your wallet.
            </span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}