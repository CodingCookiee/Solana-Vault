import { Connection, PublicKey } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Metaplex,
  walletAdapterIdentity,
  toMetaplexFile,
  CreateNftInput,
} from "@metaplex-foundation/js";
import { CreateNFTParams, NFTDetails } from "./nft.types";
import { uploadMetadataToIPFS } from "./ipfs-upload";

export async function createNFT(
  connection: Connection,
  wallet: WalletContextState,
  params: CreateNFTParams
): Promise<NFTDetails> {
  if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not properly connected");
  }

  try {
    console.log("Starting NFT creation with params:", params);

    // Initialize Metaplex
    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );

    // Check balance
    const balance = await connection.getBalance(wallet.publicKey);
    if (balance < 1000000) {
      throw new Error("Insufficient SOL balance for NFT creation costs.");
    }

    // Ensure uri is a string
    const imageUri = String(params.uri);

    // Create metadata object
    const metadata = {
      name: params.name,
      symbol: params.symbol,
      description: params.description,
      image: imageUri,
    };

    console.log("Uploading NFT metadata...", metadata);

    // Upload metadata to IPFS
    const metadataUri = await uploadMetadataToIPFS(metadata);
    console.log("NFT metadata uploaded to IPFS:", metadataUri);

    // Prepare NFT creation input
    const nftInput: CreateNftInput = {
      uri: metadataUri,
      name: params.name,
      symbol: params.symbol,
      sellerFeeBasisPoints: 0,
      creators: [
        {
          address: wallet.publicKey,
          verified: true,
          share: 100,
        },
      ],
      isMutable: true,
      maxSupply: 0, // 0 means unlimited, 1 means unique NFT
    };

    // Add collection if provided
    if (params.collectionMint) {
      try {
        // Ensure collectionMint is a proper PublicKey
        const collectionPublicKey =
          typeof params.collectionMint === "string"
            ? new PublicKey(params.collectionMint)
            : params.collectionMint;

        console.log("Adding to collection:", collectionPublicKey.toString());
        nftInput.collection = collectionPublicKey;
      } catch (error) {
        console.warn(
          "Invalid collection mint address, creating NFT without collection:",
          error
        );
        // Continue without collection rather than failing
      }
    }

    console.log("Creating NFT...");
    console.log("Creating NFT with input:", nftInput);

    // Create the NFT
    const { nft } = await metaplex.nfts().create(nftInput);

    console.log("NFT created successfully:", nft.address.toString());

    // Return NFT details
    const nftDetails: NFTDetails = {
      mint: nft.address,
      name: params.name,
      symbol: params.symbol,
      description: params.description,
      uri: imageUri,
      collection: params.collectionMint || undefined,
      creator: wallet.publicKey,
      verified: false, // Will be true after verification
    };

    return nftDetails;
  } catch (error) {
    console.error("Error creating NFT:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("toBytes")) {
        throw new Error(
          "Invalid data format. Please check your collection mint address and try again."
        );
      } else if (error.message.includes("insufficient")) {
        throw new Error(
          "Insufficient SOL balance. Please add more SOL to your wallet."
        );
      } else if (error.message.includes("Invalid public key")) {
        throw new Error(
          "Invalid collection mint address format. Please verify the address."
        );
      }
    }

    throw error;
  }
}
