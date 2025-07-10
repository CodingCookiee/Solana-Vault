"use client";

import { FC, useState, useCallback, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/common";
import { Text } from "@/components/ui/common";

// Devnet token addresses (these actually exist on devnet)
const DEVNET_TOKENS = {
  // These are common devnet token mints
  USDC_DEV: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // USDC devnet
  USDT_DEV: "EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS", // Example devnet token
  SOL: "So11111111111111111111111111111111111111112", // Wrapped SOL (same on all networks)
};

export const DevnetTokenOps: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [selectedToken, setSelectedToken] = useState(DEVNET_TOKENS.SOL);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  // Get token account address for the user
  const getUserTokenAccount = useCallback(
    (mintPubkey: PublicKey) => {
      if (!publicKey) return null;
      return getAssociatedTokenAddressSync(mintPubkey, publicKey);
    },
    [publicKey]
  );

  // Get token balance and info
  const getTokenInfo = useCallback(async () => {
    if (!publicKey || !selectedToken) return;

    try {
      setIsLoading(true);
      const mintPubkey = new PublicKey(selectedToken);
      const userTokenAccount = getUserTokenAccount(mintPubkey);

      if (!userTokenAccount) return;

      // Get mint info
      const mint = await getMint(connection, mintPubkey);
      setTokenInfo(mint);

      // Check if token account exists
      try {
        const accountInfo = await getAccount(connection, userTokenAccount);
        const balance =
          Number(accountInfo.amount) / Math.pow(10, mint.decimals);
        setTokenBalance(balance);
        setStatus(`✅ Balance: ${balance.toFixed(6)} tokens`);
      } catch (error) {
        setTokenBalance(0);
        setStatus(
          "❌ No token account found - you need to receive tokens first"
        );
      }
    } catch (error) {
      console.error("Error getting token info:", error);
      setStatus(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey, selectedToken, getUserTokenAccount]);

  // Create token account if it doesn't exist
  const createTokenAccount = useCallback(async () => {
    if (!publicKey || !sendTransaction || !selectedToken) return;

    try {
      setIsLoading(true);
      setStatus("Creating token account...");

      const mintPubkey = new PublicKey(selectedToken);
      const userTokenAccount = getUserTokenAccount(mintPubkey);

      if (!userTokenAccount)
        throw new Error("Cannot get token account address");

      // Check if account already exists
      const accountInfo = await connection.getAccountInfo(userTokenAccount);
      if (accountInfo) {
        setStatus("✅ Token account already exists");
        return;
      }

      // Create the token account
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          publicKey, // Payer
          userTokenAccount, // Associated token account
          publicKey, // Owner
          mintPubkey // Mint
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setStatus(`✅ Token account created: ${userTokenAccount.toBase58()}`);

      // Refresh balance
      setTimeout(() => getTokenInfo(), 2000);
    } catch (error) {
      console.error("Error creating token account:", error);
      setStatus(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    connection,
    publicKey,
    sendTransaction,
    selectedToken,
    getUserTokenAccount,
    getTokenInfo,
  ]);

  // Transfer tokens
  const transferTokens = useCallback(async () => {
    if (
      !publicKey ||
      !sendTransaction ||
      !selectedToken ||
      !recipientAddress ||
      !transferAmount
    )
      return;

    try {
      setIsLoading(true);
      setStatus("Transferring tokens...");

      const mintPubkey = new PublicKey(selectedToken);
      const recipientPubkey = new PublicKey(recipientAddress);

      const sourceTokenAccount = getUserTokenAccount(mintPubkey);
      const destinationTokenAccount = getAssociatedTokenAddressSync(
        mintPubkey,
        recipientPubkey
      );

      if (!sourceTokenAccount)
        throw new Error("Cannot get source token account");

      if (!tokenInfo) {
        throw new Error("Token info not loaded");
      }

      const amount = Math.floor(
        parseFloat(transferAmount) * Math.pow(10, tokenInfo.decimals)
      );

      const transaction = new Transaction();

      // Check if destination token account exists
      const destAccountInfo = await connection.getAccountInfo(
        destinationTokenAccount
      );
      if (!destAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // Payer
            destinationTokenAccount, // Associated token account
            recipientPubkey, // Owner
            mintPubkey // Mint
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          sourceTokenAccount, // Source
          destinationTokenAccount, // Destination
          publicKey, // Owner
          amount // Amount
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setStatus(
        `✅ Transferred ${transferAmount} tokens to ${recipientAddress}`
      );

      // Refresh balance
      setTimeout(() => getTokenInfo(), 2000);

      // Clear form
      setRecipientAddress("");
      setTransferAmount("");
    } catch (error) {
      console.error("Error transferring tokens:", error);
      setStatus(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    connection,
    publicKey,
    sendTransaction,
    selectedToken,
    recipientAddress,
    transferAmount,
    getUserTokenAccount,
    tokenInfo,
    getTokenInfo,
  ]);

  // Get devnet SOL (airdrop)
  const requestAirdrop = useCallback(async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);
      setStatus("Requesting SOL airdrop...");

      const signature = await connection.requestAirdrop(publicKey, 1000000000); // 1 SOL
      await connection.confirmTransaction(signature, "confirmed");

      setStatus("✅ Received 1 SOL from airdrop!");
    } catch (error) {
      console.error("Error requesting airdrop:", error);
      setStatus(
        `❌ Airdrop failed: ${
          error instanceof Error
            ? error.message
            : "Rate limited - try again later"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  // Auto-load token info when component mounts or token changes
  useEffect(() => {
    if (publicKey && selectedToken) {
      getTokenInfo();
    }
  }, [publicKey, selectedToken, getTokenInfo]);

  return (
    <AuthGate>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h3" color="primary">
                🪙 Devnet Token Operations
              </Text>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Token Selection */}
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <Text variant="h6" weight="semibold">
                Select Token
              </Text>

              <div>
                <label className="block text-sm font-medium mb-2">Token:</label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                >
                  {Object.entries(DEVNET_TOKENS).map(([symbol, address]) => (
                    <option key={address} value={address}>
                      {symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={getTokenInfo}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "Check Balance"}
                </button>

                <button
                  onClick={createTokenAccount}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  Create Token Account
                </button>
              </div>

              {/* Token Info Display */}
              {tokenInfo && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <Text variant="small" weight="semibold">
                    Token Info:
                  </Text>
                  <div className="text-xs space-y-1 mt-1">
                    <div>Decimals: {tokenInfo.decimals}</div>
                    <div>
                      Supply:{" "}
                      {(
                        Number(tokenInfo.supply) /
                        Math.pow(10, tokenInfo.decimals)
                      ).toLocaleString()}
                    </div>
                    <div>
                      Your Balance:{" "}
                      {tokenBalance !== null
                        ? `${tokenBalance.toFixed(6)}`
                        : "Loading..."}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transfer Section */}
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <Text variant="h6" weight="semibold">
                Transfer Tokens
              </Text>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Recipient Address:
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter Solana address"
                  className="w-full p-2 border rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount:
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.000001"
                  className="w-full p-2 border rounded"
                />
              </div>

              <button
                onClick={transferTokens}
                disabled={
                  isLoading ||
                  !recipientAddress ||
                  !transferAmount ||
                  tokenBalance === 0
                }
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Transfer Tokens
              </button>
            </div>
          </CardContent>
        </Card>
        {/* Status Display */}
        {status && (
          <Card>
            <CardContent className="py-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <Text variant="small">{status}</Text>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Devnet Utilities */}
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <Text variant="h6" weight="semibold">
                Devnet Utilities
              </Text>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <Text variant="small" weight="semibold" className="mb-2">
                  🚰 Get Free SOL:
                </Text>
                <Text variant="extraSmall" color="muted" className="mb-3">
                  Request free SOL for transaction fees on devnet
                </Text>
                <button
                  onClick={requestAirdrop}
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                >
                  Request 1 SOL Airdrop
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGate>
  );
};
