import { Connection } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Metaplex,
  keypairIdentity,
  irysStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { CreateCollectionParams, CollectionDetails } from "./nft.types";

export async function uploadImage(
  connection: Connection,
  wallet: WalletContextState,
  imageFile: File
): Promise<string> {
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  try {
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(wallet as any))
      .use(
        irysStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        })
      );

    // Read the file as an array buffer
    const buffer = await imageFile.arrayBuffer();
    // Convert to Uint8Array which is what Metaplex expects
    const fileData = new Uint8Array(buffer);

    // Create a Metaplex file with the binary data
    const metaplexFile = toMetaplexFile(fileData, imageFile.name);

    // Upload the file
    const { uri } = await metaplex.storage().upload(metaplexFile);
    return uri;
  } catch (error) {
    console.error("Error in uploadImage:", error);
    throw error;
  }
}

export async function createCollection(
  connection: Connection,
  wallet: WalletContextState,
  params: CreateCollectionParams
): Promise<CollectionDetails> {
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet as any))
    .use(
      irysStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  // Upload metadata
  const metadata = {
    name: params.name,
    symbol: params.symbol,
    description: params.description,
    image: params.uri,
  };

  const { uri } = await metaplex.nfts().uploadMetadata(metadata);

  // Create collection
  const { nft } = await metaplex.nfts().create({
    uri,
    name: params.name,
    symbol: params.symbol,
    sellerFeeBasisPoints: 0,
    isCollection: true,
  });

  return {
    mint: nft.address,
    name: params.name,
    symbol: params.symbol,
    description: params.description,
    uri: params.uri,
    creator: wallet.publicKey,
  };
}
