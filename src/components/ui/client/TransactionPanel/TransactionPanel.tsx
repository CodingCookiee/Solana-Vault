"use client";

import { FC, useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Button,
} from "@/components/ui/common";
import { Text } from "@/components/ui/common";

export const TransactionPanel: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  // Get wallet balance
  const getBalance = useCallback(async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setStatus("Error fetching balance");
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  // Validate Solana address
  const isValidSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  // Send SOL transaction
  const sendSOL = useCallback(async () => {
    if (!publicKey || !recipient || !amount) return;

    try {
      setIsLoading(true);
      setStatus("Preparing transaction...");

      // Validate recipient address
      if (!isValidSolanaAddress(recipient)) {
        throw new Error(
          "Invalid Solana address. Please enter a valid base58 address (44 characters)."
        );
      }

      const recipientPubKey = new PublicKey(recipient);
      const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);

      // Check minimum amount
      if (lamports < 1) {
        throw new Error("Minimum amount is 1 lamport (0.000000001 SOL)");
      }

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: lamports,
        })
      );

      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      setStatus("Sending transaction...");

      // Send transaction
      const signature = await sendTransaction(transaction, connection);

      setStatus(`Transaction sent! Signature: ${signature}`);

      // Clear form
      setRecipient("");
      setAmount("");

      // Refresh balance
      setTimeout(() => getBalance(), 2000);
    } catch (error) {
      console.error("Error sending transaction:", error);
      setStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, recipient, amount, connection, sendTransaction, getBalance]);

  // if (!publicKey) {
  //   return (
  //     <Card className="max-w-2xl mx-auto">
  //       <CardContent className="py-12">
  //         <div className="text-center space-y-4">
  //           <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
  //             <svg
  //               className="w-8 h-8 text-gray-400"
  //               fill="none"
  //               stroke="currentColor"
  //               viewBox="0 0 24 24"
  //             >
  //               <path
  //                 strokeLinecap="round"
  //                 strokeLinejoin="round"
  //                 strokeWidth={2}
  //                 d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
  //               />
  //             </svg>
  //           </div>
  //           <Text variant="h4" color="muted" align="center">
  //             Wallet Required
  //           </Text>
  //           <Text variant="small" color="muted" align="center">
  //             Please connect your wallet to use transaction features
  //           </Text>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AuthGate>
        {/* Balance Section */}
        <Card>
          <div className="flex items-center flex-col p-8 w-full h-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Text variant="h3" color="primary">
              Wallet Operations
            </Text>

            <Text variant="small" color="muted">
              Manage your SOL balance and send transactions
            </Text>
          </div>

          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                Account Balance
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="space-y-2">
                <Text variant="small" color="muted" weight="medium">
                  Current Balance
                </Text>
                <Text variant="h2" color="primary" weight="bold">
                  {balance !== null ? `${balance.toFixed(4)} SOL` : "---"}
                </Text>
              </div>
              <Button
                onClick={getBalance}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </CardContent>
          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="h5" color="default">
                  Send SOL
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="small" color="muted">
                  Transfer SOL to another Solana address
                </Text>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block">
                    <Text variant="small" weight="medium" color="default">
                      Recipient Address
                    </Text>
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter Solana address (44 characters)"
                    className={`w-full p-3 border rounded-lg text-sm transition-colors ${
                      recipient && !isValidSolanaAddress(recipient)
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-500"
                        : recipient && isValidSolanaAddress(recipient)
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 focus:ring-green-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    } focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800`}
                  />
                  {recipient && !isValidSolanaAddress(recipient) && (
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500">❌</span>
                      <Text variant="extraSmall" color="error">
                        Invalid Solana address format
                      </Text>
                    </div>
                  )}
                  {recipient && isValidSolanaAddress(recipient) && (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✅</span>
                      <Text variant="extraSmall" color="success">
                        Valid Solana address
                      </Text>
                    </div>
                  )}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <Text variant="extraSmall" color="muted">
                      💡 Need a test address? Use:{" "}
                      <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                        11111111111111111111111111111112
                      </code>
                    </Text>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block">
                    <Text variant="small" weight="medium" color="default">
                      Amount (SOL)
                    </Text>
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.001"
                    step="0.000000001"
                    min="0.000000001"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 transition-colors"
                  />
                  <Text variant="extraSmall" color="muted">
                    Minimum: 0.000000001 SOL (1 lamport) • Recommended: 0.001
                    SOL
                  </Text>
                </div>

                <Button
                  onClick={sendSOL}
                  disabled={
                    isLoading ||
                    !recipient ||
                    !amount ||
                    !isValidSolanaAddress(recipient)
                  }
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send SOL"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Card>

        {/* Send SOL Section */}

        {/* Status Display */}
        {status && (
          <Card>
            <CardContent>
              <div
                className={`p-4 rounded-lg border ${
                  status.includes("Error")
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : status.includes("sent")
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      status.includes("Error")
                        ? "bg-red-500"
                        : status.includes("sent")
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <Text
                      variant="small"
                      color={
                        status.includes("Error")
                          ? "error"
                          : status.includes("sent")
                          ? "success"
                          : "primary"
                      }
                      weight="medium"
                    >
                      {status.includes("Signature:")
                        ? "Transaction Status"
                        : "Status"}
                    </Text>
                    <Text
                      variant="extraSmall"
                      color="muted"
                      className="mt-1 break-all"
                    >
                      {status}
                    </Text>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </AuthGate>
    </div>
  );
};
