import { useState, useCallback, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as SplService from "./spl.service";
import { uploadToIPFS, uploadMetadataToIPFS } from "../nft/ipfs-upload"; // Import from NFT service
import { CreateTokenForm, CreatedToken } from "./spl.types";

// Add image upload hook similar to NFT
export function useImageUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMethod] = useState<"ipfs">("ipfs"); // Use IPFS like NFT

  const upload = async (file: File): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!file) {
        throw new Error("No file selected");
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size exceeds 10MB limit");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
      }

      // console.log("Uploading token image to IPFS via Pinata...");
      const uri = await uploadToIPFS(file);

      if (!uri) {
        throw new Error("Failed to get upload URI. Please try again.");
      }

      return uri;
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { upload, loading, error, uploadMethod };
}

export const useSplTokens = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const isReady =
    connection && wallet && wallet.publicKey && wallet.sendTransaction;

  return {
    // Service functions
    getSOLBalance: () => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.getSOLBalance(connection, wallet.publicKey);
    },

    createToken: (form: CreateTokenForm, imageUri?: string) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.createToken(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        form,
        imageUri
      );
    },

    // ... rest of the existing methods remain the same
    mintTokens: (mintAddress: string, amount: number) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.mintTokens(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress,
        amount
      );
    },

    transferTokens: (
      mintAddress: string,
      recipientAddress: string,
      amount: number
    ) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.transferTokens(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress,
        recipientAddress,
        amount
      );
    },

    burnTokens: (mintAddress: string, amount: number) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.burnTokens(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress,
        amount
      );
    },

    approveTokens: (
      mintAddress: string,
      delegateAddress: string,
      amount: number
    ) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.approveTokens(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress,
        delegateAddress,
        amount
      );
    },

    revokeTokenApproval: (mintAddress: string) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.revokeTokenApproval(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress
      );
    },

    getTokenAllowance: (mintAddress: string) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.getTokenAllowance(
        connection,
        wallet.publicKey,
        mintAddress
      );
    },

    transferTokensFrom: (
      mintAddress: string,
      ownerAddress: string,
      recipientAddress: string,
      amount: number
    ) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.transferTokensFrom(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress,
        ownerAddress,
        recipientAddress,
        amount
      );
    },

    closeTokenAccount: (mintAddress: string) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.closeTokenAccount(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress
      );
    },

    getTokenAccountInfo: (mintAddress: string) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.getTokenAccountInfo(
        connection,
        wallet.publicKey,
        mintAddress
      );
    },

    getMintInfo: (mintAddress: string) => {
      if (!connection) throw new Error("Connection not ready");
      return SplService.getMintInfo(connection, mintAddress);
    },

    getCreatedTokens: () => {
      return Promise.resolve(SplService.getCreatedTokensFromStorage());
    },

    getOwnedTokens: () => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.getOwnedTokens(connection, wallet.publicKey);
    },

    getTokenMetadata: (mintAddress: string) => {
      if (!connection) throw new Error("Connection not ready");
      return SplService.getTokenMetadata(connection, mintAddress);
    },

    removeCreatedTokenFromStorage: (mintAddress: string) => {
      SplService.removeCreatedTokenFromStorage(mintAddress);
    },

    // Wallet state
    connected: wallet?.connected || false,
    publicKey: wallet?.publicKey || null,
    connecting: wallet?.connecting || false,
    isReady: !!isReady,
  } as const;
};
