import { CollectionDetails, NFTDetails } from "./nft.types";

const COLLECTIONS_KEY = "solana_nft_collections";
const NFTS_KEY = "solana_nft_nfts";

export interface StoredCollection extends CollectionDetails {
  createdAt: string;
  imageUrl?: string;
}

export interface StoredNFT extends NFTDetails {
  createdAt: string;
  imageUrl?: string;
}

export function saveCollection(
  collection: CollectionDetails,
  imageUrl?: string
): void {
  try {
    const collections = getStoredCollections();
    const storedCollection: StoredCollection = {
      ...collection,
      createdAt: new Date().toISOString(),
      imageUrl,
    };

    collections.push(storedCollection);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  } catch (error) {
    console.error("Error saving collection:", error);
  }
}

export function saveNFT(nft: NFTDetails, imageUrl?: string): void {
  try {
    const nfts = getStoredNFTs();
    const storedNFT: StoredNFT = {
      ...nft,
      createdAt: new Date().toISOString(),
      imageUrl,
    };

    nfts.push(storedNFT);
    localStorage.setItem(NFTS_KEY, JSON.stringify(nfts));
  } catch (error) {
    console.error("Error saving NFT:", error);
  }
}

// Add this new function to update NFT verification status
export function updateNFTVerificationStatus(
  mintAddress: string,
  verified: boolean
): void {
  try {
    const nfts = getStoredNFTs();
    const updatedNFTs = nfts.map((nft) => {
      if (nft.mint.toString() === mintAddress) {
        return { ...nft, verified };
      }
      return nft;
    });
    localStorage.setItem(NFTS_KEY, JSON.stringify(updatedNFTs));
  } catch (error) {
    console.error("Error updating NFT verification status:", error);
  }
}

// Add this function to update an entire NFT record
export function updateStoredNFT(
  mintAddress: string,
  updatedNFT: NFTDetails
): void {
  try {
    const nfts = getStoredNFTs();
    const updatedNFTs = nfts.map((nft) => {
      if (nft.mint.toString() === mintAddress) {
        return {
          ...nft,
          ...updatedNFT,
          // Preserve the original createdAt and imageUrl
          createdAt: nft.createdAt,
          imageUrl: nft.imageUrl,
        };
      }
      return nft;
    });
    localStorage.setItem(NFTS_KEY, JSON.stringify(updatedNFTs));
  } catch (error) {
    console.error("Error updating stored NFT:", error);
  }
}

export function getStoredCollections(): StoredCollection[] {
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading collections:", error);
    return [];
  }
}

export function getStoredNFTs(): StoredNFT[] {
  try {
    const stored = localStorage.getItem(NFTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading NFTs:", error);
    return [];
  }
}

export function getNFTsByCollection(collectionMint: string): StoredNFT[] {
  const nfts = getStoredNFTs();
  return nfts.filter((nft) => nft.collection?.toString() === collectionMint);
}

export function deleteCollection(mintAddress: string): void {
  try {
    const collections = getStoredCollections();
    const filtered = collections.filter(
      (c) => c.mint.toString() !== mintAddress
    );
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting collection:", error);
  }
}

export function deleteNFT(mintAddress: string): void {
  try {
    const nfts = getStoredNFTs();
    const filtered = nfts.filter((n) => n.mint.toString() !== mintAddress);
    localStorage.setItem(NFTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting NFT:", error);
  }
}
