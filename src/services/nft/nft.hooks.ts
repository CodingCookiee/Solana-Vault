import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { createCollection, uploadImage } from "./create-collection";
import { createNFT } from "./create-nft";
import { verifyNFTInCollection, getNFTDetails } from "./verify-nft";
import { uploadToIPFS } from "./ipfs-upload";
import {
  saveCollection,
  saveNFT,
  getStoredCollections,
  getStoredNFTs,
  StoredCollection,
  StoredNFT,
} from "./storage";
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
    try {
      setLoading(true);
      setError(null);
      const result = await createCollection(connection, wallet, params);
      if (result) {
        saveCollection(result, params.uri);
      }
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
    try {
      setLoading(true);
      setError(null);
      const result = await createNFT(connection, wallet, params);
      if (result) {
        saveNFT(result, params.uri);
      }
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

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size exceeds 10MB limit");
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
      }

      let uri: string;

      if (uploadMethod === "ipfs") {
        console.log("Uploading to IPFS via Pinata...");
        uri = await uploadToIPFS(file);
      } else {
        console.log("Uploading to Arweave...");
        uri = await uploadImage(connection, wallet, file);
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

      // Try alternative upload method on failure
      if (
        uploadMethod === "arweave" &&
        err instanceof Error &&
        err.message.includes("Arweave")
      ) {
        console.log("Arweave failed, switching to IPFS...");
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
      return await getNFTDetails(connection, wallet, publicKey);
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

export function useStoredItems() {
  const [collections, setCollections] = useState<StoredCollection[]>([]);
  const [nfts, setNfts] = useState<StoredNFT[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStoredItems = () => {
    try {
      setLoading(true);
      const storedCollections = getStoredCollections();
      const storedNFTs = getStoredNFTs();
      setCollections(storedCollections);
      setNfts(storedNFTs);
    } catch (error) {
      console.error("Error loading stored items:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    collections,
    nfts,
    loading,
    loadStoredItems,
    refreshItems: loadStoredItems,
  };
}
