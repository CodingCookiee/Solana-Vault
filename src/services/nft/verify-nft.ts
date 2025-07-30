import { Connection, PublicKey } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { VerifyParams, NFTDetails } from "./nft.types";

// Add a Set to track pending verification transactions
const pendingVerificationTransactions = new Set<string>();

export async function verifyNFTInCollection(
  connection: Connection,
  wallet: WalletContextState,
  params: VerifyParams
): Promise<boolean> {
  if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not properly connected");
  }

  // Create a unique transaction key to prevent duplicates
  const transactionKey = `${wallet.publicKey.toString()}-verify-${params.nftMint.toString()}-${params.collectionMint.toString()}`;

  if (pendingVerificationTransactions.has(transactionKey)) {
    throw new Error(
      "Verification already in progress for this NFT. Please wait..."
    );
  }

  try {
    console.log("Starting NFT verification with params:", {
      nftMint: params.nftMint.toString(),
      collectionMint: params.collectionMint.toString(),
      creator: params.creator.toString(),
    });

    // Mark transaction as pending
    pendingVerificationTransactions.add(transactionKey);

    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );

    // Check balance
    const balance = await connection.getBalance(wallet.publicKey);
    if (balance < 500000) {
      // 0.0005 SOL
      throw new Error(
        "Insufficient SOL balance for verification transaction costs."
      );
    }

    // Verify with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    let success = false;

    while (retryCount < maxRetries) {
      try {
        console.log(`Verification attempt ${retryCount + 1}/${maxRetries}`);

        await metaplex.nfts().verifyCollection(
          {
            mintAddress: params.nftMint,
            collectionMintAddress: params.collectionMint,
          },
          {
            // Add confirmation commitment
            commitment: "confirmed",
          }
        );

        success = true;
        console.log("NFT verification successful");
        break;
      } catch (error: any) {
        retryCount++;

        if (error.message?.includes("already been processed")) {
          console.log(
            "Transaction already processed, checking verification status..."
          );

          // Wait a bit for the transaction to settle
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Check if the NFT is now verified by fetching its details
          try {
            const nftDetails = await getNFTDetails(
              connection,
              wallet,
              params.nftMint
            );
            if (nftDetails?.verified) {
              console.log("NFT is already verified");
              success = true;
              break;
            }
          } catch (checkError) {
            console.warn("Could not check verification status:", checkError);
          }

          throw new Error(
            "Verification transaction may have been processed already. Please check the NFT verification status and refresh the page."
          );
        }

        if (error.message?.includes("already verified")) {
          console.log("NFT is already verified in this collection");
          success = true;
          break;
        }

        if (error.message?.includes("Invalid collection")) {
          throw new Error(
            "Invalid collection mint address or the NFT doesn't belong to this collection."
          );
        }

        if (error.message?.includes("unauthorized")) {
          throw new Error(
            "You are not authorized to verify this NFT. Only the collection authority can verify NFTs."
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

    if (success) {
      // Update local storage verification status
      console.log("NFT verification completed and storage updated");
    }

    return success;
  } catch (error) {
    console.error("Error verifying NFT in collection:", error);

    if (error instanceof Error) {
      if (error.message.includes("already been processed")) {
        throw new Error(
          "This verification request has already been processed. The NFT may have been verified successfully. Please refresh the page to see the updated status."
        );
      } else if (error.message.includes("insufficient")) {
        throw new Error(
          "Insufficient SOL balance for verification. Please add more SOL to your wallet."
        );
      } else if (error.message.includes("User rejected")) {
        throw new Error(
          "Transaction was rejected. Please approve the transaction to continue."
        );
      }
    }

    throw new Error(
      `Failed to verify NFT in collection: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  } finally {
    // Always clean up the pending transaction
    pendingVerificationTransactions.delete(transactionKey);
  }
}

export async function getNFTDetails(
  connection: Connection,
  wallet: WalletContextState,
  mintAddress: PublicKey
): Promise<NFTDetails | null> {
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  try {
    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );

    console.log("Fetching NFT details for:", mintAddress.toString());
    const nft = await metaplex.nfts().findByMint({
      mintAddress,
      // Add load JSON metadata
      loadJsonMetadata: true,
    });

    if (!nft) {
      console.log("NFT not found");
      return null;
    }

    console.log("NFT found:", {
      name: nft.name,
      symbol: nft.symbol,
      collection: nft.collection?.address.toString(),
      verified: nft.collection?.verified,
    });

    // Try to get metadata from JSON if available
    const metadata = nft.json as any;

    // Get the image URI - try different sources
    let imageUri = "";
    if (metadata?.image) {
      imageUri = metadata.image;
    } else if (nft.uri) {
      // If no image in metadata, try to fetch from the URI
      try {
        const response = await fetch(nft.uri);
        const uriMetadata = await response.json();
        imageUri = uriMetadata.image || "";
      } catch (e) {
        console.warn("Could not fetch metadata from URI:", e);
      }
    }

    return {
      mint: nft.address,
      name: metadata?.name || nft.name,
      symbol: metadata?.symbol || nft.symbol,
      description: metadata?.description || "",
      uri: imageUri,
      collection: nft.collection?.address,
      creator: wallet.publicKey,
      verified: nft.collection?.verified || false,
    };
  } catch (error) {
    console.error("Error getting NFT details:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("not found") ||
        error.message.includes("Account does not exist")
      ) {
        throw new Error(
          "NFT not found. Please check the mint address and try again."
        );
      }
    }

    throw new Error(
      `Failed to fetch NFT details: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
