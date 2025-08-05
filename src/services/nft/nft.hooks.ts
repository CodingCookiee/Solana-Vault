import { useState, useCallback, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { createCollection, uploadImage } from "./create-collection";
import { createNFT } from "./create-nft";
import { verifyNFTInCollection } from "./verify-nft";
import { uploadToIPFS } from "./ipfs-upload";
import {
  fetchWalletNFTs,
  fetchWalletCollections,
  fetchWalletRegularNFTs,
  getWalletNFTDetails,
  WalletNFT,
} from "./wallet-nfts";
import {
  CreateCollectionParams,
  CreateNFTParams,
  VerifyParams,
  CollectionDetails,
  NFTDetails,
} from "./nft.types";

export function useCreateCollection() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (
    params: CreateCollectionParams
  ): Promise<CollectionDetails | null> => {
    if (loading) {
      console.warn("Collection creation already in progress");
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await createCollection(connection, wallet, params);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create collection";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useCreateNFT() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (
    params: CreateNFTParams
  ): Promise<NFTDetails | null> => {
    if (loading) {
      console.warn("NFT creation already in progress");
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await createNFT(connection, wallet, params);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create NFT";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useVerifyNFT() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async (params: VerifyParams): Promise<boolean> => {
    if (loading) {
      console.warn("NFT verification already in progress");
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      return await verifyNFTInCollection(connection, wallet, params);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to verify NFT";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { verify, loading, error };
}

export function useImageUpload() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"arweave" | "ipfs">("ipfs");

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

      let uri: string | null = null;
      if (uploadMethod === "ipfs") {
        // console.log("Uploading to IPFS via Pinata...");
        uri = await uploadToIPFS(file);
      } else {
        console.log("Uploading to Arweave...");
        // uri = await uploadImage(connection, wallet, file);
        uri = null; // Explicitly set uri to null for now
      }

      if (!uri) {
        throw new Error("Failed to get upload URI. Please try again.");
      }

      return uri;
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMessage);

      if (
        uploadMethod === "arweave" &&
        err instanceof Error &&
        err.message.includes("Arweave")
      ) {
        // console.log("Arweave failed, switching to IPFS...");
        setUploadMethod("ipfs");
        return null;
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  return { upload, loading, error, uploadMethod, setUploadMethod };
}

export function useNFTDetails() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async (
    mintAddress: string
  ): Promise<NFTDetails | null> => {
    try {
      setLoading(true);
      setError(null);
      const publicKey = new PublicKey(mintAddress);
      const walletNFT = await getWalletNFTDetails(
        connection,
        wallet,
        publicKey
      );

      if (!walletNFT) return null;

      // Convert WalletNFT to NFTDetails
      const nftDetails: NFTDetails = {
        mint: walletNFT.mint,
        name: walletNFT.name,
        symbol: walletNFT.symbol,
        description: walletNFT.description,
        uri: walletNFT.uri,
        collection: walletNFT.collection,
        creator: walletNFT.creator,
        verified: walletNFT.verified,
      };

      return nftDetails;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch NFT details";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchDetails, loading, error };
}

// Main hook for wallet NFTs - replaces storage-based approach
export function useWalletNFTs() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [collections, setCollections] = useState<WalletNFT[]>([]);
  const [nfts, setNfts] = useState<WalletNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNFTs = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setCollections([]);
      setNfts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // console.log("Fetching NFTs from wallet...");
      const walletCollections = await fetchWalletCollections(
        connection,
        wallet
      );
      const walletNFTs = await fetchWalletRegularNFTs(connection, wallet);

      setCollections(walletCollections);
      setNfts(walletNFTs);

      // console.log(
      //   `Loaded ${walletCollections.length} collections and ${walletNFTs.length} NFTs`
      // );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch wallet NFTs";
      setError(errorMessage);
      setCollections([]);
      setNfts([]);
    } finally {
      setLoading(false);
    }
  }, [connection, wallet]);

  // Auto-fetch when wallet connects
  useEffect(() => {
    if (wallet.connected) {
      fetchNFTs();
    } else {
      setCollections([]);
      setNfts([]);
      setError(null);
    }
  }, [wallet.connected, fetchNFTs]);

  return {
    collections,
    nfts,
    loading,
    error,
    fetchNFTs,
    refresh: fetchNFTs,
  };
}

// Legacy hook for backward compatibility - now just wraps useWalletNFTs
export function useStoredItems() {
  const walletData = useWalletNFTs();

  return {
    collections: walletData.collections.map((nft) => ({
      ...nft,
      createdAt: nft.createdAt.toISOString(),
      imageUrl: nft.image,
      mint: nft.mint,
      name: nft.name,
      symbol: nft.symbol,
      description: nft.description,
      uri: nft.uri,
      creator: nft.creator,
      verified: nft.verified,
    })),
    nfts: walletData.nfts.map((nft) => ({
      ...nft,
      createdAt: nft.createdAt.toISOString(),
      imageUrl: nft.image,
      mint: nft.mint,
      name: nft.name,
      symbol: nft.symbol,
      description: nft.description,
      uri: nft.uri,
      collection: nft.collection,
      creator: nft.creator,
      verified: nft.verified,
    })),
    loading: walletData.loading,
    loadStoredItems: walletData.fetchNFTs,
    refreshItems: walletData.refresh,
  };
}