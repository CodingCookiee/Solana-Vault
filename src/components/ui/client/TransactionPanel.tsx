"use client";

import { FC, useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

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
        throw new Error("Invalid Solana address. Please enter a valid base58 address (44 characters).");
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
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, recipient, amount, connection, sendTransaction, getBalance]);

  if (!publicKey) {
    return (
      <div className="text-center text-gray-500 py-8">
        Please connect your wallet to use transaction features
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Wallet Operations</h3>
      
      {/* Balance Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Balance:</span>
          <button
            onClick={getBalance}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
        <div className="text-2xl font-bold text-blue-600">
          {balance !== null ? `${balance.toFixed(4)} SOL` : "Click refresh to load"}
        </div>
      </div>

      {/* Send SOL Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Send SOL</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Recipient Address:</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter Solana address (44 characters)"
              className={`w-full p-2 border rounded-md text-sm ${
                recipient && !isValidSolanaAddress(recipient) 
                  ? 'border-red-500 bg-red-50' 
                  : recipient && isValidSolanaAddress(recipient)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300'
              }`}
            />
            {recipient && !isValidSolanaAddress(recipient) && (
              <p className="text-xs text-red-500 mt-1">
                ❌ Invalid Solana address format
              </p>
            )}
            {recipient && isValidSolanaAddress(recipient) && (
              <p className="text-xs text-green-500 mt-1">
                ✅ Valid Solana address
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              💡 Need a test address? Use: <code className="bg-gray-200 px-1 rounded text-xs">11111111111111111111111111111112</code>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount (SOL):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              step="0.000000001"
              min="0.000000001"
              className="w-full p-2 border rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum: 0.000000001 SOL (1 lamport) • Recommended: 0.001 SOL
            </p>
          </div>
          <button
            onClick={sendSOL}
            disabled={isLoading || !recipient || !amount || !isValidSolanaAddress(recipient)}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send SOL"}
          </button>
        </div>
      </div>

      {/* Status Display */}
      {status && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">{status}</p>
        </div>
      )}
    </div>
  );
};
