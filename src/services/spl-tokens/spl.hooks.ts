import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as SplService from "./spl.service";
import { CreateTokenForm, CreatedToken } from "./spl.types";

export const useSplTokens = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const isReady =
    connection && wallet && wallet.publicKey && wallet.sendTransaction;

  return {
    // Service functions
    getSOLBalance: () => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.getSOLBalance(connection, wallet.publicKey);
    },

    createToken: (form: CreateTokenForm) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.createToken(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        form
      );
    },

    mintTokens: (mintAddress: string, amount: number) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.mintTokens(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress,
        amount
      );
    },

    transferTokens: (
      mintAddress: string,
      recipientAddress: string,
      amount: number
    ) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.transferTokens(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress,
        recipientAddress,
        amount
      );
    },

    burnTokens: (mintAddress: string, amount: number) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.burnTokens(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress,
        amount
      );
    },

    getTokenAccountInfo: (mintAddress: string) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.getTokenAccountInfo(
        connection,
        wallet.publicKey,
        mintAddress
      );
    },

    getMintInfo: (mintAddress: string) => {
      if (!connection) throw new Error("Connection not ready");
      return SplService.getMintInfo(connection, mintAddress);
    },

    // New token history functions
    getCreatedTokens: () => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.getCreatedTokens(connection, wallet.publicKey);
    },

    getOwnedTokens: () => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.getOwnedTokens(connection, wallet.publicKey);
    },

    getTokenMetadata: (mintAddress: string) => {
      if (!connection) throw new Error("Connection not ready");
      return SplService.getTokenMetadata(connection, mintAddress);
    },

    // Wallet state
    connected: wallet?.connected || false,
    publicKey: wallet?.publicKey || null,
    connecting: wallet?.connecting || false,
    isReady: !!isReady,
  } as const;
};
