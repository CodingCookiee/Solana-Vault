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

// Add a Set to track pending transactions
const pendingTransactions = new Set<string>();

export async function createNFT(
  connection: Connection,
  wallet: WalletContextState,
  params: CreateNFTParams
): Promise<NFTDetails> {
  if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not properly connected");
  }

  // Create a unique transaction key to prevent duplicates
  const transactionKey = `${wallet.publicKey.toString()}-${params.name}-${
    params.symbol
  }-${Date.now()}`;

  if (pendingTransactions.has(transactionKey)) {
    throw new Error("Transaction already in progress. Please wait...");
  }

  try {
    console.log("Starting NFT creation with params:", params);

    // Mark transaction as pending
    pendingTransactions.add(transactionKey);

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

    // Create metadata object with timestamp to ensure uniqueness
    const metadata = {
      name: params.name,
      symbol: params.symbol,
      description: params.description,
      image: imageUri,
      // Add timestamp to ensure unique metadata
      attributes: [
        {
          trait_type: "Created",
          value: new Date().toISOString(),
        },
      ],
    };

    console.log("Uploading NFT metadata...", metadata);

    // Upload metadata to IPFS
    const metadataUri = await uploadMetadataToIPFS(metadata);
    console.log("NFT metadata uploaded to IPFS:", metadataUri);

    // Prepare NFT creation input with additional uniqueness
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
      maxSupply: 0, // 0 means unlimited supply
     
    };

    // Add collection if provided
    if (params.collectionMint) {
      try {
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
      }
    }

    console.log("Creating NFT...");
    console.log("Creating NFT with input:", nftInput);

    // Create the NFT with retry logic
    let nft;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const result = await metaplex.nfts().create(nftInput, {
          // Add confirmation commitment
          commitment: "confirmed",
        });
        nft = result.nft;
        break;
      } catch (error: any) {
        retryCount++;

        if (error.message?.includes("already been processed")) {
          console.log(
            "Transaction already processed, checking if NFT was created..."
          );

          // Wait a bit for the transaction to settle
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Try to find the created NFT by checking recent transactions or user's NFTs
          // This is a simplified approach - in production you might want to query recent transactions
          throw new Error(
            "NFT may have been created successfully. Please check your wallet and refresh the page."
          );
        }

        if (retryCount >= maxRetries) {
          throw error;
        }

        console.log(
          `Retry attempt ${retryCount}/${maxRetries} after error:`,
          error.message
        );
        // Wait before retry with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!nft) {
      throw new Error("Failed to create NFT after multiple attempts");
    }

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
      verified: false,
    };

    return nftDetails;
  } catch (error) {
    console.error("Error creating NFT:", error);

    if (error instanceof Error) {
      if (error.message.includes("already been processed")) {
        throw new Error(
          "This NFT creation request has already been processed. The NFT may have been created successfully. Please check your wallet and refresh the page."
        );
      } else if (error.message.includes("toBytes")) {
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
  } finally {
    // Always clean up the pending transaction
    pendingTransactions.delete(transactionKey);
  }
}
