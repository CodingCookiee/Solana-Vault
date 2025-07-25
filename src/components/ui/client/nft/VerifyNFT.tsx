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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFetchDetails = async () => {
    if (!formData.nftMint) {
      alert("Please enter an NFT mint address");
      return;
    }

    try {
      const details = await fetchDetails(formData.nftMint);
      setNftDetails(details);
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

    try {
      const nftMint = new PublicKey(formData.nftMint);
      const collectionMint = new PublicKey(formData.collectionMint);

      const success = await verify({
        nftMint,
        collectionMint,
        creator: publicKey,
      });

      if (success) {
        setVerificationSuccess(true);
        // Refresh NFT details after verification
        const updatedDetails = await fetchDetails(formData.nftMint);
        setNftDetails(updatedDetails);
      }
    } catch (error) {
      console.error("Error verifying NFT:", error);
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
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter NFT mint address"
              />
              <Button
                type="button"
                onClick={handleFetchDetails}
                disabled={fetching || !formData.nftMint}
                variant="outline"
              >
                {fetching ? "Loading..." : "Fetch"}
              </Button>
            </div>
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
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter collection mint address"
            />
          </div>

          {(verifyError || fetchError) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <Text color="error" variant="small">
                {verifyError || fetchError}
              </Text>
            </div>
          )}

          {verificationSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <Text color="success" weight="medium">
                NFT verified successfully in collection!
              </Text>
            </div>
          )}

          <Button type="submit" disabled={verifying} className="w-full">
            {verifying ? "Verifying..." : "Verify NFT in Collection"}
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
                <Text variant="small">{nftDetails.description}</Text>
              </div>
              <div className="flex items-center justify-between">
                <Text variant="small" color="muted">
                  Creator:
                </Text>
                <Text variant="small" className="font-mono text-xs">
                  {nftDetails.creator.toString()}
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
