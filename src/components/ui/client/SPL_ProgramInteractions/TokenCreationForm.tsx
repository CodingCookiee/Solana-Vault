"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Text,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/common";
import { useSplTokens, useImageUpload } from "@/services/spl-tokens";
import type { CreateTokenForm, TransactionResult } from "@/services/spl-tokens";
import {
  Coins,
  Plus,
  Sparkles,
  Loader2,
  ArrowRight,
  Hash,
  FileImage,
  Upload,
  Zap,
  FileText,
  Info,
} from "lucide-react";

interface TokenCreationFormProps {
  onTokenCreated: (mintAddress: string) => void;
  setStatus: (status: string) => void;
}

export const TokenCreationForm: React.FC<TokenCreationFormProps> = ({
  onTokenCreated,
  setStatus,
}) => {
  const solana = useSplTokens();
  const {
    upload,
    loading: uploading,
    error: uploadError,
    uploadMethod,
  } = useImageUpload();

  const [loading, setLoading] = useState(false);

  // Token creation form
  const [tokenName, setTokenName] = useState<string>("My Token");
  const [symbol, setSymbol] = useState<string>("TKN");
  const [description, setDescription] = useState<string>(
    "A custom SPL token on Solana blockchain"
  );
  const [amount, setAmount] = useState<string>("1000");
  const [decimals, setDecimals] = useState<string>("9");

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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

  const handleCreateToken = async () => {
    if (!solana.isReady) {
      setStatus("❌ Wallet not ready. Please connect your wallet.");
      return;
    }

    try {
      setLoading(true);
      setStatus("⏳ Creating token...");

      const decimalsNum = parseInt(decimals);
      const amountNum = parseInt(amount);

      if (isNaN(decimalsNum) || decimalsNum < 0 || decimalsNum > 9) {
        throw new Error("Decimals must be a number between 0 and 9");
      }

      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Amount must be a positive number");
      }

      if (!tokenName || !symbol) {
        throw new Error("Token name and symbol are required");
      }

      let imageUri: string | undefined;

      // Upload image if provided
      if (imageFile) {
        setStatus("⏳ Uploading token image...");
        const uploadResult = await upload(imageFile);
        if (!uploadResult) {
          throw new Error("Failed to upload image");
        }
        imageUri = uploadResult; // Now we're assigning a non-null string
      }

      setStatus("⏳ Creating token and metadata...");

      const form: CreateTokenForm = {
        tokenName,
        symbol,
        description,
        amount: amountNum,
        decimals: decimalsNum,
      };

      const result = await solana.createToken(form, imageUri);

      if (result.success) {
        onTokenCreated(result.signature);
        setStatus(`✅ Token created successfully!

Mint Address: ${result.signature}

To add your token to Phantom wallet:
1. Open Phantom and click "Tokens"
2. Click the "+" button
3. Paste your token mint address: ${result.signature}
4. Click "Add"

View on Solana Explorer:
https://explorer.solana.com/address/${result.signature}?cluster=devnet`);

        // Reset form
        setTokenName("My Token");
        setSymbol("TKN");
        setDescription("A custom SPL token on Solana blockchain");
        setAmount("1000");
        setImageFile(null);
        setImagePreview("");
      } else {
        handleResult(result, "");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      console.error("Operation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResult = (result: TransactionResult, successMessage: string) => {
    if (result.success) {
      setStatus(`✅ ${successMessage}: ${result.signature}`);
    } else {
      setStatus(`❌ Error: ${result.error}`);
    }
  };

  const isFormValid =
    tokenName.trim() !== "" &&
    symbol.trim() !== "" &&
    description.trim() !== "" &&
    !isNaN(parseInt(amount)) &&
    parseInt(amount) > 0 &&
    !isNaN(parseInt(decimals)) &&
    parseInt(decimals) >= 0 &&
    parseInt(decimals) <= 9;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Token Basic Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Token Details */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <label className="block">
                <Text variant="small" weight="medium">
                  Token Name *
                </Text>
              </label>
            </div>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 transition-colors"
              placeholder="My Token"
              disabled={loading || uploading}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <label className="block">
                <Text variant="small" weight="medium">
                  Symbol *
                </Text>
              </label>
            </div>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 transition-colors"
              placeholder="TKN"
              disabled={loading || uploading}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <label className="block">
                <Text variant="small" weight="medium">
                  Description *
                </Text>
              </label>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 transition-colors resize-none"
              placeholder="A unique token on Solana blockchain"
              disabled={loading || uploading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Coins className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <label className="block">
                  <Text variant="small" weight="medium">
                    Initial Amount *
                  </Text>
                </label>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 transition-colors"
                placeholder="1000"
                disabled={loading || uploading}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <label className="block">
                  <Text variant="small" weight="medium">
                    Decimals *
                  </Text>
                </label>
              </div>
              <input
                type="number"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                min="0"
                max="9"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 transition-colors"
                placeholder="9"
                disabled={loading || uploading}
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileImage className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <label className="block">
                <Text variant="small" weight="medium">
                  Token Image (Optional)
                </Text>
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
                    className="w-32 h-32 object-cover rounded-lg border mx-auto"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    disabled={loading || uploading}
                    className="mx-auto"
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center">
                  <FileImage className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <Text variant="small" color="muted" className="mb-4">
                    Upload token logo or icon
                  </Text>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading || uploading}
                    onClick={() =>
                      document.getElementById("token-image")?.click()
                    }
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select Image
                  </Button>
                </div>
              )}

              <input
                id="token-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading || uploading}
                className="hidden"
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <Text variant="extraSmall" color="muted">
                Image will be uploaded to {uploadMethod.toUpperCase()} storage
              </Text>
            </div>
          </div>

          {/* Storage Information */}
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
              <Text
                variant="extraSmall"
                className="text-purple-800 dark:text-purple-200"
              >
                Token metadata will be stored on IPFS with your image and
                description
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <Text color="error" variant="small" weight="medium">
                {uploadError}
              </Text>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Button */}
      <Button
        onClick={handleCreateToken}
        disabled={loading || uploading || !isFormValid}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg group border-0"
        size="lg"
      >
        {uploading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading Image...</span>
          </div>
        ) : loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Creating Token...</span>
          </div>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            <span>Create Token</span>
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>

      {/* Transaction Info */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <Text variant="extraSmall" weight="medium">
            Transaction Details
          </Text>
        </div>
        <Text variant="extraSmall" color="muted">
          Network fee: ~0.01 SOL • Creates mint account and metadata • You will
          be the mint authority
        </Text>
      </div>
    </motion.div>
  );
};
