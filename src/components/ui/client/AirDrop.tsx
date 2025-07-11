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
  CardDescription,
  Button,
  Text,
} from "@/components/ui/common";

// Devnet token addresses (these actually exist on devnet)
const DEVNET_TOKENS = {
  // These are common devnet token mints
  USDC_DEV: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // USDC devnet
  USDT_DEV: "EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS", // Example devnet token
  SOL: "So11111111111111111111111111111111111111112", // Wrapped SOL (same on all networks)
};

export const AirDrop: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [selectedToken, setSelectedToken] = useState(DEVNET_TOKENS.SOL);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const [isLoadingTransfer, setIsLoadingTransfer] = useState(false);
  const [isLoadingAirdrop, setIsLoadingAirdrop] = useState(false);
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
      setIsLoadingBalance(true);
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
      setIsLoadingBalance(false);
    }
  }, [connection, publicKey, selectedToken, getUserTokenAccount]);

  // Create token account if it doesn't exist
  const createTokenAccount = useCallback(async () => {
    if (!publicKey || !sendTransaction || !selectedToken) return;

    try {
      setIsLoadingCreate(true);
      setStatus("Creating token account...");

      const mintPubkey = new PublicKey(selectedToken);
      const userTokenAccount = getUserTokenAccount(mintPubkey);

      if (!userTokenAccount)
        throw new Error("Cannot get token account address");

      // Check if account already exists
      const accountInfo = await connection.getAccountInfo(userTokenAccount);
      if (accountInfo) {
        setStatus("✅ Token account already exists");
        // Still refresh balance after checking
        setTimeout(() => getTokenInfo(), 1000);
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
      setIsLoadingCreate(false);
    }
  }, [
    connection,
    publicKey,
    sendTransaction,
    selectedToken,
    getUserTokenAccount,
    getTokenInfo,
  ]);

  // Validate if address is a wallet address or token account
  const validateRecipientAddress = useCallback(
    async (address: string) => {
      try {
        const pubkey = new PublicKey(address);
        const accountInfo = await connection.getAccountInfo(pubkey);

        if (!accountInfo) {
          return {
            isValid: true,
            isWallet: true,
            message: "New wallet address (will create token account)",
          };
        }

        // Check if it's a token account by looking at the data length and owner
        if (
          accountInfo.owner.equals(TOKEN_PROGRAM_ID) &&
          accountInfo.data.length === 165
        ) {
          return {
            isValid: true,
            isWallet: false,
            message: "This is a token account address",
          };
        }

        return {
          isValid: true,
          isWallet: true,
          message: "Existing wallet address",
        };
      } catch (error) {
        return {
          isValid: false,
          isWallet: false,
          message: "Invalid address format",
        };
      }
    },
    [connection]
  );

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
      setIsLoadingTransfer(true);
      setStatus("Validating recipient address...");

      const mintPubkey = new PublicKey(selectedToken);

      // Validate recipient address
      const validation = await validateRecipientAddress(recipientAddress);
      if (!validation.isValid) {
        throw new Error(`Invalid recipient address: ${validation.message}`);
      }

      const sourceTokenAccount = getUserTokenAccount(mintPubkey);
      if (!sourceTokenAccount)
        throw new Error("Cannot get source token account");

      if (!tokenInfo) {
        throw new Error("Token info not loaded - click 'Check Balance' first");
      }

      const amount = Math.floor(
        parseFloat(transferAmount) * Math.pow(10, tokenInfo.decimals)
      );

      let destinationTokenAccount: PublicKey;
      let recipientWallet: PublicKey;

      if (validation.isWallet) {
        // Recipient address is a wallet - derive token account
        recipientWallet = new PublicKey(recipientAddress);
        destinationTokenAccount = getAssociatedTokenAddressSync(
          mintPubkey,
          recipientWallet
        );
        setStatus(`Transferring to wallet address (${validation.message})...`);
      } else {
        // Recipient address is already a token account
        destinationTokenAccount = new PublicKey(recipientAddress);

        // Get the token account info to find the owner
        const tokenAccountInfo = await getAccount(
          connection,
          destinationTokenAccount
        );
        recipientWallet = tokenAccountInfo.owner;
        setStatus("Transferring to token account directly...");
      }

      const transaction = new Transaction();

      // Check if destination token account exists (only if it's a derived address)
      if (validation.isWallet) {
        const destAccountInfo = await connection.getAccountInfo(
          destinationTokenAccount
        );
        if (!destAccountInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              publicKey, // Payer
              destinationTokenAccount, // Associated token account
              recipientWallet, // Owner
              mintPubkey // Mint
            )
          );
          setStatus("Creating destination token account and transferring...");
        }
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

      setStatus(`✅ Transferred ${transferAmount} tokens! Tx: ${signature}`);

      // Refresh balance
      setTimeout(() => getTokenInfo(), 2000);

      // Clear form
      setRecipientAddress("");
      setTransferAmount("");
    } catch (error) {
      console.error("Error transferring tokens:", error);
      let errorMessage = "Unknown error";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Provide specific error messages
        if (errorMessage.includes("TokenOwnerOffCurveError")) {
          errorMessage =
            "Invalid address: Please use a wallet address, not a token account address";
        } else if (errorMessage.includes("insufficient")) {
          errorMessage = "Insufficient token balance for this transfer";
        } else if (errorMessage.includes("Invalid address")) {
          errorMessage = "Please enter a valid Solana wallet address";
        }
      }

      setStatus(`❌ Error: ${errorMessage}`);
    } finally {
      setIsLoadingTransfer(false);
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
    validateRecipientAddress,
  ]);

  // Get devnet SOL (airdrop)
  const requestAirdrop = useCallback(async () => {
    if (!publicKey) return;

    try {
      setIsLoadingAirdrop(true);
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
      setIsLoadingAirdrop(false);
    }
  }, [connection, publicKey]);

  // Auto-load token info when component mounts or token changes
  useEffect(() => {
    if (publicKey && selectedToken) {
      getTokenInfo();
    }
  }, [publicKey, selectedToken, getTokenInfo]);

  // Helper function to check if address is valid
  const isValidSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthGate>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Devnet Utilities */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                Devnet Utilities
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="small" color="muted">
                Get devnet SOL for transaction fees
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-600 dark:text-yellow-400">
                    ⚠️
                  </span>
                  <Text variant="small" weight="semibold" color="warning">
                    Devnet Only
                  </Text>
                </div>
                <Text variant="extraSmall" color="muted">
                  This airdrop only works on devnet. You need SOL to pay for
                  transaction fees.
                </Text>
              </div>

              <Button
                onClick={requestAirdrop}
                disabled={isLoadingAirdrop}
                variant="outline"
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                {isLoadingAirdrop ? "Requesting..." : "Get 1 SOL (Airdrop)"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGate>
  );
};
