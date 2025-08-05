import { Connection, PublicKey } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";

export interface WalletNFT {
  mint: PublicKey;
  name: string;
  symbol: string;
  description: string;
  uri: string;
  image?: string;
  collection?: PublicKey;
  creator: PublicKey;
  verified: boolean;
  isCollection: boolean;
  createdAt: Date;
}

export async function fetchWalletNFTs(
  connection: Connection,
  wallet: WalletContextState
): Promise<WalletNFT[]> {
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  try {
    console.log("Fetching NFTs from wallet:", wallet.publicKey.toString());

    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );

    // Find all NFTs in the wallet
    const nfts = await metaplex.nfts().findAllByOwner({
      owner: wallet.publicKey,
    });

    console.log(`Found ${nfts.length} NFTs in wallet`);

    const walletNFTs: WalletNFT[] = [];

    // Process each NFT with better error handling
    await Promise.allSettled(
      nfts.map(async (nft) => {
        try {
          console.log("Processing NFT:", nft.address.toString());

          // If nft already has all properties, skip loading
          const fullNft = 'model' in nft && nft.model === 'metadata'
            ? await metaplex.nfts().load({ metadata: nft, loadJsonMetadata: true })
            : nft;

          let imageUri = "";
          let description = "";

          // Try to get metadata from JSON
          if (fullNft.json) {
            const metadata = fullNft.json as any;
            description = metadata.description || "";
            imageUri = metadata.image || "";
          }

          // If no image from JSON metadata, try to fetch from URI
          if (!imageUri && fullNft.uri) {
            try {
              const response = await fetch(fullNft.uri);
              if (response.ok) {
                const uriMetadata = await response.json();
                imageUri = uriMetadata.image || "";
                if (!description) {
                  description = uriMetadata.description || "";
                }
              }
            } catch (e) {
              console.warn("Could not fetch metadata from URI:", e);
            }
          }

          const walletNFT: WalletNFT = {
            mint: fullNft.address,
            name: fullNft.name,
            symbol: fullNft.symbol,
            description,
            uri: imageUri,
            image: imageUri,
            collection: fullNft.collection?.address,
            creator: wallet.publicKey!,
            verified: fullNft.collection?.verified || false,
            isCollection: !!fullNft.collectionDetails,
            createdAt: new Date(), // We can't get exact creation date from on-chain data easily
          };

          walletNFTs.push(walletNFT);
        } catch (error) {
          console.warn(
            `Error processing NFT ${nft.address.toString()}:`,
            error
          );
          // Continue processing other NFTs even if one fails
        }
      })
    );

    console.log(`Successfully processed ${walletNFTs.length} NFTs`);
    return walletNFTs.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    ); // Sort by newest first
  } catch (error) {
    console.error("Error fetching wallet NFTs:", error);
    throw new Error(
      `Failed to fetch NFTs from wallet: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function fetchWalletCollections(
  connection: Connection,
  wallet: WalletContextState
): Promise<WalletNFT[]> {
  const allNFTs = await fetchWalletNFTs(connection, wallet);
  return allNFTs.filter((nft) => nft.isCollection);
}

export async function fetchWalletRegularNFTs(
  connection: Connection,
  wallet: WalletContextState
): Promise<WalletNFT[]> {
  const allNFTs = await fetchWalletNFTs(connection, wallet);
  return allNFTs.filter((nft) => !nft.isCollection);
}

// Get NFT details by mint address
export async function getWalletNFTDetails(
  connection: Connection,
  wallet: WalletContextState,
  mintAddress: PublicKey
): Promise<WalletNFT | null> {
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  try {
    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );

    const nft = await metaplex.nfts().findByMint({
      mintAddress,
      loadJsonMetadata: true,
    });

    if (!nft) {
      return null;
    }

    let imageUri = "";
    let description = "";

    if (nft.json) {
      const metadata = nft.json as any;
      description = metadata.description || "";
      imageUri = metadata.image || "";
    }

    if (!imageUri && nft.uri) {
      try {
        const response = await fetch(nft.uri);
        if (response.ok) {
          const uriMetadata = await response.json();
          imageUri = uriMetadata.image || "";
          if (!description) {
            description = uriMetadata.description || "";
          }
        }
      } catch (e) {
        console.warn("Could not fetch metadata from URI:", e);
      }
    }

    return {
      mint: nft.address,
      name: nft.name,
      symbol: nft.symbol,
      description,
      uri: imageUri,
      image: imageUri,
      collection: nft.collection?.address,
      creator: wallet.publicKey!,
      verified: nft.collection?.verified || false,
      isCollection: !!nft.collectionDetails,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error getting NFT details:", error);
    throw new Error(
      `Failed to fetch NFT details: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}