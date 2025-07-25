import { Connection, PublicKey } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Metaplex,
  keypairIdentity,
  irysStorage,
} from "@metaplex-foundation/js";
import { CreateNFTParams, NFTDetails } from "./nft.types";

export async function createNFT(
  connection: Connection,
  wallet: WalletContextState,
  params: CreateNFTParams
): Promise<NFTDetails> {
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

  // Create NFT
  const { nft } = await metaplex.nfts().create({
    uri,
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

  return {
    mint: nft.address,
    name: params.name,
    symbol: params.symbol,
    description: params.description,
    uri: params.uri,
    collection: params.collectionMint,
    creator: wallet.publicKey,
    verified: false,
  };
}
