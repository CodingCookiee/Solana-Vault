"use client";

import { FC, useState, useCallback, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { motion, AnimatePresence } from "framer-motion";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Button,
  Text,
} from "@/components/ui/common";
import {
  Send,
  RefreshCw,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Copy,
  ExternalLink,
  TrendingUp,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export const TransactionPanel: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [lastTransaction, setLastTransaction] = useState<string>("");
  const [showAddressPreview, setShowAddressPreview] = useState(false);

  // Get wallet balance
  const getBalance = useCallback(async () => {
    if (!publicKey) return;

    try {
      setIsRefreshing(true);
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setStatus("Error fetching balance");
      toast.error("Failed to fetch balance");
    } finally {
      setIsRefreshing(false);
    }
  }, [connection, publicKey]);

  // Auto-fetch balance on mount
  useEffect(() => {
    if (publicKey) {
      getBalance();
    }
  }, [publicKey, getBalance]);

  // Validate Solana address
  const isValidSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return address.length >= 32 && address.length <= 44;
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

      if (!isValidSolanaAddress(recipient)) {
        throw new Error("Invalid Solana address. Please enter a valid base58 address.");
      }

      const recipientPubKey = new PublicKey(recipient);
      const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);

      if (lamports < 1) {
        throw new Error("Minimum amount is 1 lamport (0.000000001 SOL)");
      }

      if (balance && lamports > balance * LAMPORTS_PER_SOL) {
        throw new Error("Insufficient balance for this transaction");
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: lamports,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      setStatus("Sending transaction...");

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setStatus(`✅ Transaction sent successfully!`);
      setLastTransaction(signature);
      toast.success("Transaction sent successfully!");

      // Clear form
      setRecipient("");
      setAmount("");

      // Refresh balance
      setTimeout(() => getBalance(), 2000);
    } catch (error) {
      console.error("Error sending transaction:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, recipient, amount, connection, sendTransaction, getBalance, balance]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatAddress = (address: string) => {
    if (address.length < 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getBalanceColor = () => {
    if (balance === null) return "text-gray-500";
    if (balance < 0.001) return "text-red-500";
    if (balance < 0.1) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <AuthGate>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          <div className="relative mx-auto w-fit">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur"></div>
            <div className="relative p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg">
              <Send className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div>
            <Text variant="h4" className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold">
              Send & Receive SOL
            </Text>
            <Text variant="body" color="muted" className="max-w-md mx-auto">
              Transfer SOL securely to any Solana address
            </Text>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <Text variant="small" color="muted" weight="medium">
                      Wallet Balance
                    </Text>
                  </div>
                  
                  <div className="flex items-baseline space-x-2">
                    <Text variant="h2" className={`font-bold ${getBalanceColor()}`}>
                      {balance !== null ? balance.toFixed(4) : "-.----"}
                    </Text>
                    <Text variant="small" color="muted">SOL</Text>
                  </div>

                  {balance !== null && (
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <Text variant="extraSmall" className="text-green-600 dark:text-green-400">
                        ≈ ${(balance * 23.45).toFixed(2)} USD
                      </Text>
                    </div>
                  )}
                </div>

                <Button
                  onClick={getBalance}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Balance Status */}
              {balance !== null && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className={`flex items-center space-x-2 ${
                    balance < 0.001 ? 'text-red-600 dark:text-red-400' : 
                    balance < 0.1 ? 'text-yellow-600 dark:text-yellow-400' : 
                    'text-green-600 dark:text-green-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      balance < 0.001 ? 'bg-red-500' : 
                      balance < 0.1 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    } animate-pulse`}></div>
                    <Text variant="extraSmall" weight="medium">
                      {balance < 0.001 ? 'Low balance - get SOL to continue' :
                       balance < 0.1 ? 'Consider getting more SOL for transactions' :
                       'Sufficient balance for transactions'}
                    </Text>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Send Transaction Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>
                    <Text variant="h5">Send SOL</Text>
                  </CardTitle>
                  <CardDescription>
                    <Text variant="small" color="muted">
                      Transfer SOL to another wallet address
                    </Text>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Recipient Address Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block">
                    <Text variant="small" weight="medium" color="default">
                      Recipient Address
                    </Text>
                  </label>
                  {recipient && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddressPreview(!showAddressPreview)}
                      className="h-6 px-2 text-xs"
                    >
                      {showAddressPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter Solana wallet address..."
                    className={`w-full p-4 pr-12 border rounded-lg text-sm transition-all duration-200 ${
                      recipient && !isValidSolanaAddress(recipient)
                        ? "border-red-300 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 dark:border-red-700"
                        : recipient && isValidSolanaAddress(recipient)
                        ? "border-green-300 bg-green-50 dark:bg-green-900/20 focus:ring-green-500 dark:border-green-700"
                        : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    } focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800`}
                  />
                  
                  {recipient && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValidSolanaAddress(recipient) ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Address Validation Feedback */}
                <AnimatePresence>
                  {recipient && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isValidSolanaAddress(recipient) ? (
                        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <div className="space-y-1">
                            <Text variant="extraSmall" className="text-green-800 dark:text-green-200 font-medium">
                              Valid Solana address
                            </Text>
                            {showAddressPreview && (
                              <Text variant="extraSmall" color="muted" className="font-mono break-all">
                                {recipient}
                              </Text>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <Text variant="extraSmall" className="text-red-800 dark:text-red-200">
                            Invalid address format. Please enter a valid Solana address.
                          </Text>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Test Address Suggestion */}
                {!recipient && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-2">
                      <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-800/50 mt-0.5">
                        <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="space-y-2">
                        <Text variant="extraSmall" weight="medium" className="text-blue-800 dark:text-blue-200">
                          Need a test address?
                        </Text>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRecipient("11111111111111111111111111111112")}
                          className="h-7 px-2 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-800/50 dark:hover:bg-blue-700/50 text-blue-700 dark:text-blue-300"
                        >
                          Use System Program Address
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div className="space-y-3">
                <label className="block">
                  <Text variant="small" weight="medium" color="default">
                    Amount (SOL)
                  </Text>
                </label>
                
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.001"
                    step="0.000000001"
                    min="0.000000001"
                    max={balance || undefined}
                    className="w-full p-4 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 transition-colors text-lg font-medium"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Text variant="small" color="muted" weight="medium">SOL</Text>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Text variant="extraSmall" color="muted">
                    Minimum: 0.000000001 SOL
                  </Text>
                  {balance && amount && (
                    <Text variant="extraSmall" color="muted">
                      ≈ ${(parseFloat(amount) * 23.45).toFixed(2)} USD
                    </Text>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                {balance && balance > 0 && (
                  <div className="flex space-x-2">
                    {[0.001, 0.01, 0.1].filter(amt => amt <= balance).map((amt) => (
                      <Button
                        key={amt}
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(amt.toString())}
                        className="text-xs h-7 px-3 border-gray-200 dark:border-gray-700"
                      >
                        {amt} SOL
                      </Button>
                    ))}
                    {balance > 0.001 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount((balance * 0.5).toFixed(6))}
                        className="text-xs h-7 px-3 border-gray-200 dark:border-gray-700"
                      >
                        50%
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Send Button */}
              <Button
                onClick={sendSOL}
                disabled={
                  isLoading ||
                  !recipient ||
                  !amount ||
                  !isValidSolanaAddress(recipient) ||
                  (balance !== null && parseFloat(amount) > balance)
                }
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg group border-0"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Transaction...</span>
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    <span>Send SOL</span>
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              {/* Transaction Fee Info */}
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <Text variant="extraSmall" weight="medium">Transaction Fee</Text>
                </div>
                <Text variant="extraSmall" color="muted">
                  Network fee: ~0.000005 SOL • Estimated total: {amount ? (parseFloat(amount) + 0.000005).toFixed(6) : "0.000005"} SOL
                </Text>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Display */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`overflow-hidden ${
                status.includes("Error") || status.includes("❌")
                  ? "border-red-200 dark:border-red-800"
                  : status.includes("✅") 
                  ? "border-green-200 dark:border-green-800"
                  : "border-blue-200 dark:border-blue-800"
              }`}>
                <div className={`h-1 ${
                  status.includes("Error") || status.includes("❌")
                    ? "bg-gradient-to-r from-red-400 to-pink-400"
                    : status.includes("✅")
                    ? "bg-gradient-to-r from-green-400 to-emerald-400"
                    : "bg-gradient-to-r from-blue-400 to-purple-400"
                }`}></div>
                
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-1.5 rounded-full mt-0.5 ${
                      status.includes("Error") || status.includes("❌")
                        ? "bg-red-100 dark:bg-red-900/30"
                        : status.includes("✅")
                        ? "bg-green-100 dark:bg-green-900/30"  
                        : "bg-blue-100 dark:bg-blue-900/30"
                    }`}>
                      {status.includes("Error") || status.includes("❌") ? (
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      ) : status.includes("✅") ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <Text variant="small" weight="medium" className={
                        status.includes("Error") || status.includes("❌")
                          ? "text-red-800 dark:text-red-200"
                          : status.includes("✅")
                          ? "text-green-800 dark:text-green-200"
                          : "text-blue-800 dark:text-blue-200"
                      }>
                        Transaction Status
                      </Text>
                      
                      <Text variant="extraSmall" color="muted" className="break-all">
                        {status}
                      </Text>

                      {/* Transaction Hash Display */}
                      {lastTransaction && (
                        <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Text variant="extraSmall" color="muted">
                            Transaction:
                          </Text>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                            {formatAddress(lastTransaction)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(lastTransaction)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://explorer.solana.com/tx/${lastTransaction}?cluster=devnet`, '_blank')}
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthGate>
  );
};