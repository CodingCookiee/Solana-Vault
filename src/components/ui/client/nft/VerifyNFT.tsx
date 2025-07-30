"use client";

import React, { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Button } from "@/components/ui/common/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card";
import { Text } from "@/components/ui/common/text";
import { useVerifyNFT, useNFTDetails } from "@/services/nft/nft.hooks";
import { NFTDetails } from "@/services/nft/nft.types";
import { useWallet } from "@solana/wallet-adapter-react";

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
      alert("Please enter an NFT mint address");
      return;
    }

    if (!validatePublicKey(formData.nftMint)) {
      alert("Please enter a valid NFT mint address");
      return;
    }

    try {
      const details = await fetchDetails(formData.nftMint);
      setNftDetails(details);

      if (details?.collection) {
        // Auto-fill collection mint if NFT has a collection
        setFormData((prev) => ({
          ...prev,
          collectionMint: details.collection?.toString() || prev.collectionMint,
        }));
      }
    } catch (error) {
      console.error("Error fetching NFT details:", error);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !publicKey) {
      alert("Please connect your wallet first");
      return;
    }

    if (!formData.nftMint || !formData.collectionMint) {
      alert("Please enter both NFT and Collection mint addresses");
      return;
    }

    if (!validatePublicKey(formData.nftMint)) {
      alert("Please enter a valid NFT mint address");
      return;
    }

    if (!validatePublicKey(formData.collectionMint)) {
      alert("Please enter a valid Collection mint address");
      return;
    }

    // Prevent double submission
    if (isSubmitting || verifying || fetching) {
      console.warn("Already processing request...");
      return;
    }

    try {
      setIsSubmitting(true);

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
        console.log("Verification successful, refreshing NFT details...");

        // Refresh NFT details after verification
        const updatedDetails = await fetchDetails(formData.nftMint);
        setNftDetails(updatedDetails);
      }
    } catch (error) {
      console.error("Error verifying NFT:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardContent>
          <Text color="muted" align="center">
            Please connect your wallet to verify NFTs
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Verify NFT in Collection</CardTitle>
        <Text variant="small" color="muted">
          Verify that an NFT belongs to a specific collection to establish
          authenticity
        </Text>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              NFT Mint Address *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="nftMint"
                value={formData.nftMint}
                onChange={handleInputChange}
                required
                disabled={verifying || fetching || isSubmitting}
                className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  formData.nftMint && !validatePublicKey(formData.nftMint)
                    ? "border-red-500"
                    : ""
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
              >
                {fetching ? "Loading..." : "Fetch"}
              </Button>
            </div>
            {formData.nftMint && !validatePublicKey(formData.nftMint) && (
              <Text variant="small" color="error" className="mt-1">
                Invalid NFT mint address format
              </Text>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Collection Mint Address *
            </label>
            <input
              type="text"
              name="collectionMint"
              value={formData.collectionMint}
              onChange={handleInputChange}
              required
              disabled={verifying || fetching || isSubmitting}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                formData.collectionMint &&
                !validatePublicKey(formData.collectionMint)
                  ? "border-red-500"
                  : ""
              }`}
              placeholder="Enter collection mint address"
            />
            {formData.collectionMint &&
              !validatePublicKey(formData.collectionMint) && (
                <Text variant="small" color="error" className="mt-1">
                  Invalid collection mint address format
                </Text>
              )}
          </div>

          {(verifyError || fetchError) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <Text color="error" variant="small">
                {verifyError || fetchError}
              </Text>
              {(verifyError?.includes("already been processed") ||
                verifyError?.includes("already in progress")) && (
                <Text variant="extraSmall" color="muted" className="mt-2">
                  Please check the verification status and refresh if the NFT
                  was verified successfully
                </Text>
              )}
            </div>
          )}

          {verificationSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <Text color="success" weight="medium">
                NFT verified successfully in collection! ✅
              </Text>
            </div>
          )}

          <Button
            type="submit"
            disabled={
              verifying ||
              fetching ||
              isSubmitting ||
              !validatePublicKey(formData.nftMint) ||
              !validatePublicKey(formData.collectionMint)
            }
            className="w-full"
          >
            {verifying || isSubmitting
              ? "Verifying..."
              : "Verify NFT in Collection"}
          </Button>
        </form>

        {nftDetails && (
          <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
            <Text weight="medium" className="mb-3">
              NFT Details:
            </Text>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text variant="small" color="muted">
                  Name:
                </Text>
                <Text variant="small">{nftDetails.name}</Text>
              </div>
              <div className="flex items-center justify-between">
                <Text variant="small" color="muted">
                  Symbol:
                </Text>
                <Text variant="small">{nftDetails.symbol}</Text>
              </div>
              <div className="flex items-center justify-between">
                <Text variant="small" color="muted">
                  Description:
                </Text>
                <Text variant="small" className="text-right max-w-xs">
                  {nftDetails.description || "No description"}
                </Text>
              </div>
              {nftDetails.collection && (
                <div className="flex items-center justify-between">
                  <Text variant="small" color="muted">
                    Collection:
                  </Text>
                  <Text variant="small" className="font-mono text-xs">
                    {nftDetails.collection.toString().slice(0, 8)}...
                  </Text>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Text variant="small" color="muted">
                  Creator:
                </Text>
                <Text variant="small" className="font-mono text-xs">
                  {nftDetails.creator.toString().slice(0, 8)}...
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Text variant="small" color="muted">
                  Verified:
                </Text>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      nftDetails.verified ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <Text
                    variant="small"
                    color={nftDetails.verified ? "success" : "error"}
                  >
                    {nftDetails.verified ? "Yes" : "No"}
                  </Text>
                </div>
              </div>
              {nftDetails.uri && (
                <div className="mt-4">
                  <Text variant="small" color="muted" className="mb-2">
                    Image:
                  </Text>
                  <img
                    src={nftDetails.uri}
                    alt={nftDetails.name}
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
