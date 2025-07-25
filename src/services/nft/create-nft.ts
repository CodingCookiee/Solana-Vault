import { Connection, PublicKey } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Metaplex,
  walletAdapterIdentity,
  irysStorage,
} from "@metaplex-foundation/js";
import { CreateNFTParams, NFTDetails } from "./nft.types";

export async function createNFT(
  connection: Connection,
  wallet: WalletContextState,
  params: CreateNFTParams
): Promise<NFTDetails> {
  if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not properly connected");
  }

  try {
    // Use walletAdapterIdentity instead of keypairIdentity
    const metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity(wallet))
      .use(
        irysStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        })
      );

    // Check balance
    const balance = await connection.getBalance(wallet.publicKey);
    if (balance < 1000000) {
      // Less than 0.001 SOL
      throw new Error("Insufficient SOL balance for NFT creation costs.");
    }

    // Ensure uri is a string
    const imageUri = String(params.uri);

    // Upload metadata
    const metadata = {
      name: params.name,
      symbol: params.symbol,
      description: params.description,
      image: imageUri,
    };

    console.log("Uploading NFT metadata...", metadata);
    const metadataResult = await metaplex.nfts().uploadMetadata(metadata);

    let metadataUri: string;
    if (typeof metadataResult === "string") {
      metadataUri = metadataResult;
    } else if (
      metadataResult &&
      typeof metadataResult === "object" &&
      "uri" in metadataResult
    ) {
      metadataUri = metadataResult.uri;
    } else {
      throw new Error("Metadata upload failed - no valid URI returned");
    }

    console.log("NFT metadata uploaded:", metadataUri);

    // Create NFT
    console.log("Creating NFT...");
    const { nft } = await metaplex.nfts().create({
      uri: metadataUri,
      name: params.name,
      symbol: params.symbol,
      sellerFeeBasisPoints: 0,
      collection: params.collectionMint
        ? {
            address: params.collectionMint,
            verified: false,
          }
        : undefined,
    });

    console.log("NFT created:", nft.address.toString());

    return {
      mint: nft.address,
      name: params.name,
      symbol: params.symbol,
      description: params.description,
      uri: imageUri,
      collection: params.collectionMint,
      creator: wallet.publicKey,
      verified: false,
    };
  } catch (error) {
    console.error("Error creating NFT:", error);

    if (error instanceof Error) {
      if (error.message.includes("insufficient funds")) {
        throw new Error(
          "Insufficient funds to create NFT. Please add more SOL to your wallet."
        );
      }
      if (error.message.includes("User rejected")) {
        throw new Error(
          "Transaction was rejected. Please approve the transaction to continue."
        );
      }
    }

    throw new Error("Failed to create NFT. Please try again.");
  }
}
