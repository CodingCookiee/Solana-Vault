import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { createCollection, uploadImage } from "./create-collection";
import { createNFT } from "./create-nft";
import { verifyNFTInCollection, getNFTDetails } from "./verify-nft";
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
      return await createCollection(connection, wallet, params);
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
      return await createNFT(connection, wallet, params);
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

  const upload = async (file: File): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!file) {
        throw new Error("No file selected");
      }

      // Check file size (10MB limit for example)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size exceeds 10MB limit");
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
      }

      return await uploadImage(connection, wallet, file);
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

  return { upload, loading, error };
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
