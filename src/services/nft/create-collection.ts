import { Connection } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Metaplex,
  walletAdapterIdentity,
  irysStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { CreateCollectionParams, CollectionDetails } from "./nft.types";1
import { uploadToIPFS, uploadMetadataToIPFS } from "./ipfs-upload";

export async function uploadImage(
  connection: Connection,
  wallet: WalletContextState,
  imageFile: File
): Promise<string> {
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

    // Check if we have enough SOL for storage
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(`Wallet balance: ${balance / 1e9} SOL`);

    if (balance < 1000000) {
      // Less than 0.001 SOL
      throw new Error(
        "Insufficient SOL balance for storage costs. Please add some SOL to your wallet."
      );
    }

    // Read the file as an array buffer
    const buffer = await imageFile.arrayBuffer();
    // Convert to Uint8Array which is what Metaplex expects
    const fileData = new Uint8Array(buffer);

    // Create a Metaplex file with the binary data
    const metaplexFile = toMetaplexFile(fileData, imageFile.name, {
      contentType: imageFile.type,
    });

    console.log(
      `Uploading file: ${imageFile.name}, size: ${fileData.length} bytes`
    );

    // Try a direct upload to arweave.net for development purposes
    const uploadResult = await metaplex.storage().upload(metaplexFile);
    console.log("Upload result:", uploadResult);

    // Handle both string and object with uri property
    let uri: string;
    if (typeof uploadResult === "string") {
      uri = uploadResult;
    } else if (
      uploadResult &&
      typeof uploadResult === "object" &&
      "uri" in uploadResult
    ) {
      uri = uploadResult.uri;
    } else {
      throw new Error("File upload failed - no valid URI returned");
    }

    if (!uri) {
      throw new Error("File upload failed - empty URI returned");
    }

    console.log(`File uploaded successfully: ${uri}`);
    return uri;
  } catch (error) {
    console.error("Error in uploadImage:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("insufficient funds")) {
        throw new Error(
          "Insufficient funds for storage. Please add more SOL to your wallet."
        );
      }
      if (error.message.includes("Network Error")) {
        throw new Error(
          "Network error connecting to storage. Please check your connection and try again."
        );
      }
      if (error.message.includes("User rejected")) {
        throw new Error(
          "Transaction was rejected. Please approve the transaction to continue."
        );
      }
      if (error.message.includes("No provider available")) {
        throw new Error(
          "Storage provider error. Make sure you're on Devnet and your wallet is properly connected."
        );
      }
    }

    throw new Error(
      `Failed to upload image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function createCollection(
  connection: Connection,
  wallet: WalletContextState,
  params: CreateCollectionParams
): Promise<CollectionDetails> {
  if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not properly connected");
  }

  try {
    // Use walletAdapterIdentity instead of keypairIdentity
    const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

    // Create metadata object
    const metadata = {
      name: params.name,
      symbol: params.symbol,
      description: params.description,
      image: params.uri,
    };

    console.log("Uploading metadata to IPFS...", metadata);

    // Try to upload metadata to IPFS first
    let metadataUri: string;
    try {
      metadataUri = await uploadMetadataToIPFS(metadata);
      console.log("Metadata uploaded to IPFS:", metadataUri);
    } catch (ipfsError) {
      console.warn("IPFS metadata upload failed, falling back to Arweave:", ipfsError);
      
      // Fallback to Arweave
      const metaplexWithIrys = metaplex.use(
        irysStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        })
      );
      
      const uploadResult = await metaplexWithIrys.nfts().uploadMetadata(metadata);
      
      if (typeof uploadResult === "string") {
        metadataUri = uploadResult;
      } else if (uploadResult && typeof uploadResult === "object" && "uri" in uploadResult) {
        metadataUri = uploadResult.uri;
      } else {
        throw new Error("Metadata upload failed - no valid URI returned");
      }
      
      console.log("Metadata uploaded to Arweave:", metadataUri);
    }

    // Create collection
    console.log("Creating collection NFT...");
    const { nft } = await metaplex.nfts().create({
      uri: metadataUri,
      name: params.name,
      symbol: params.symbol,
      sellerFeeBasisPoints: 0,
      isCollection: true,
    });

    console.log("Collection created:", nft.address.toString());

    return {
      mint: nft.address,
      name: params.name,
      symbol: params.symbol,
      description: params.description,
      uri: params.uri,
      creator: wallet.publicKey,
    };
  } catch (error) {
    console.error("Error creating collection:", error);

    if (error instanceof Error) {
      if (error.message.includes("insufficient funds")) {
        throw new Error(
          "Insufficient funds to create collection. Please add more SOL to your wallet."
        );
      }
      if (error.message.includes("User rejected")) {
        throw new Error(
          "Transaction was rejected. Please approve the transaction to continue."
        );
      }
    }

    throw new Error("Failed to create collection. Please try again.");
  }
}