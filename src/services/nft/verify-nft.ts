import { Connection, PublicKey } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { VerifyParams, NFTDetails } from "./nft.types";

export async function verifyNFTInCollection(
  connection: Connection,
  wallet: WalletContextState,
  params: VerifyParams
): Promise<boolean> {
  if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not properly connected");
  }

  try {
    const metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity(wallet));

    await metaplex.nfts().verifyCollection({
      mintAddress: params.nftMint,
      collectionMintAddress: params.collectionMint,
    });

    return true;
  } catch (error) {
    console.error("Error verifying NFT in collection:", error);
    throw new Error("Failed to verify NFT in collection");
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
    const metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity(wallet));

    const nft = await metaplex.nfts().findByMint({ mintAddress });

    if (!nft) return null;

    const metadata = nft.json as any;

    return {
      mint: nft.address,
      name: metadata.name || nft.name,
      symbol: metadata.symbol || nft.symbol,
      description: metadata.description || "",
      uri: metadata.image || "",
      collection: nft.collection?.address,
      creator: wallet.publicKey,
      verified: nft.collection?.verified || false,
    };
  } catch (error) {
    console.error("Error getting NFT details:", error);
    return null;
  }
}