import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  SplTokenServiceState,
  TokenInfo,
  TransactionResult,
  MintInfo,
} from "./spl.types";
import * as SplService from "./spl.service";

export const useSplTokens = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Add safety checks
  const isReady = connection && wallet && wallet.publicKey;

  return {
    // Service functions with safety checks
    getSOLBalance: () => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.getSOLBalance(connection, wallet.publicKey);
    },
    createToken: (decimals?: number) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.createToken(connection, wallet, decimals);
    },
    createTokenAccount: (mintAddress: string) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.createTokenAccount(connection, wallet, mintAddress);
    },
    getAssociatedTokenAddress: (mintAddress: string) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.getAssociatedTokenAddressForWallet(
        mintAddress,
        wallet.publicKey
      );
    },
    mintTokens: (
      mintAddress: string,
      amount: number,
      destinationAddress?: string
    ) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.mintTokens(
        connection,
        wallet,
        mintAddress,
        amount,
        destinationAddress
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
        wallet,
        mintAddress,
        recipientAddress,
        amount
      );
    },
    burnTokens: (mintAddress: string, amount: number) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.burnTokens(connection, wallet, mintAddress, amount);
    },
    approveTokens: (
      mintAddress: string,
      delegateAddress: string,
      amount: number
    ) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.approveTokens(
        connection,
        wallet,
        mintAddress,
        delegateAddress,
        amount
      );
    },
    revokeApproval: (mintAddress: string) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.revokeApproval(connection, wallet, mintAddress);
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
    tokenAccountExists: (mintAddress: string) => {
      if (!isReady) throw new Error("Wallet not ready");
      return SplService.tokenAccountExists(
        connection,
        wallet.publicKey,
        mintAddress
      );
    },

    // Wallet info with safety checks
    connected: wallet?.connected || false,
    publicKey: wallet?.publicKey || null,
    connecting: wallet?.connecting || false,
    isReady,
  } as const;
};
