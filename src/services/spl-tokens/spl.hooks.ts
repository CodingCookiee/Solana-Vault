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

    // New approve and revoke functions
    approveTokens: (
      mintAddress: string,
      delegateAddress: string,
      amount: number
    ) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.approveTokens(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress,
        delegateAddress,
        amount
      );
    },

    revokeTokenApproval: (mintAddress: string) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.revokeTokenApproval(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress
      );
    },

    getTokenAllowance: (mintAddress: string) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.getTokenAllowance(
        connection,
        wallet.publicKey,
        mintAddress
      );
    },

    transferTokensFrom: (
      mintAddress: string,
      ownerAddress: string,
      recipientAddress: string,
      amount: number
    ) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.transferTokensFrom(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress,
        ownerAddress,
        recipientAddress,
        amount
      );
    },

    closeTokenAccount: (mintAddress: string) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.closeTokenAccount(
        connection,
        wallet.publicKey,
        wallet.sendTransaction!,
        mintAddress
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

    // Updated token history functions
    getCreatedTokens: () => {
      // Use local storage instead of RPC call
      return Promise.resolve(SplService.getCreatedTokensFromStorage());
    },

    getOwnedTokens: () => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.getOwnedTokens(connection, wallet.publicKey);
    },

    getTokenMetadata: (mintAddress: string) => {
      if (!connection) throw new Error("Connection not ready");
      return SplService.getTokenMetadata(connection, mintAddress);
    },

    // Local storage functions
    removeCreatedTokenFromStorage: (mintAddress: string) => {
      SplService.removeCreatedTokenFromStorage(mintAddress);
    },

    // Wallet state
    connected: wallet?.connected || false,
    publicKey: wallet?.publicKey || null,
    connecting: wallet?.connecting || false,
    isReady: !!isReady,
  } as const;
};
