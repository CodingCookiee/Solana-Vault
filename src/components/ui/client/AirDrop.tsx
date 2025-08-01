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
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Download,
  Coins,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Copy,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// Devnet token addresses
const DEVNET_TOKENS = {
  USDC_DEV: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  USDT_DEV: "EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS",
  SOL: "So11111111111111111111111111111111111111112",
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
  const [lastTransaction, setLastTransaction] = useState<string>("");

  // ... (keeping all the existing logic methods unchanged) ...
  const getUserTokenAccount = useCallback(
    (mintPubkey: PublicKey) => {
      if (!publicKey) return null;
      return getAssociatedTokenAddressSync(mintPubkey, publicKey);
    },
    [publicKey]
  );

  const getTokenInfo = useCallback(async () => {
    if (!publicKey || !selectedToken) return;

    try {
      setIsLoadingBalance(true);
      const mintPubkey = new PublicKey(selectedToken);
      const userTokenAccount = getUserTokenAccount(mintPubkey);

      if (!userTokenAccount) return;

      const mint = await getMint(connection, mintPubkey);
      setTokenInfo(mint);

      try {
        const accountInfo = await getAccount(connection, userTokenAccount);
        const balance = Number(accountInfo.amount) / Math.pow(10, mint.decimals);
        setTokenBalance(balance);
        setStatus(`✅ Balance: ${balance.toFixed(6)} tokens`);
      } catch (error) {
        setTokenBalance(0);
        setStatus("❌ No token account found - you need to receive tokens first");
      }
    } catch (error) {
      console.error("Error getting token info:", error);
      setStatus(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [connection, publicKey, selectedToken, getUserTokenAccount]);

  const requestAirdrop = useCallback(async () => {
    if (!publicKey) return;

    try {
      setIsLoadingAirdrop(true);
      setStatus("Requesting SOL airdrop...");

      const signature = await connection.requestAirdrop(publicKey, 1000000000);
      await connection.confirmTransaction(signature, "confirmed");

      setStatus("✅ Received 1 SOL from airdrop!");
      setLastTransaction(signature);
      toast.success("Airdrop successful! 1 SOL received");
    } catch (error) {
      console.error("Error requesting airdrop:", error);
      const errorMsg = error instanceof Error ? error.message : "Rate limited - try again later";
      setStatus(`❌ Airdrop failed: ${errorMsg}`);
      toast.error("Airdrop failed. Please try again later.");
    } finally {
      setIsLoadingAirdrop(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (publicKey && selectedToken) {
      getTokenInfo();
    }
  }, [publicKey, selectedToken, getTokenInfo]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 opacity-20 blur"></div>
            <div className="relative p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
              <Download className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div>
            <Text variant="h4" className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
              Devnet Token Operations
            </Text>
            <Text variant="body" color="muted" className="max-w-md mx-auto">
              Get test SOL and manage devnet tokens for development
            </Text>
          </div>
        </motion.div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400"></div>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-800/50 mt-0.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-1">
                  <Text variant="small" weight="semibold" className="text-amber-800 dark:text-amber-200">
                    Devnet Environment Only
                  </Text>
                  <Text variant="extraSmall" className="text-amber-700 dark:text-amber-300">
                    These operations only work on Solana devnet. Tokens have no real-world value and are for testing purposes only.
                  </Text>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SOL Airdrop Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>
                    <Text variant="h5">SOL Airdrop</Text>
                  </CardTitle>
                  <CardDescription>
                    <Text variant="small" color="muted">
                      Get 1 SOL for transaction fees on devnet
                    </Text>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Text variant="small" weight="medium">Airdrop Amount</Text>
                  </div>
                  <Text variant="h4" className="text-blue-600 dark:text-blue-400 font-bold">
                    1.0 SOL
                  </Text>
                </div>
                <Text variant="extraSmall" color="muted">
                  Sufficient for hundreds of transactions on devnet
                </Text>
              </div>

              <Button
                onClick={requestAirdrop}
                disabled={isLoadingAirdrop}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg group border-0"
                size="lg"
              >
                {isLoadingAirdrop ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Requesting Airdrop...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>Request SOL Airdrop</span>
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              {/* Rate Limit Info */}
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <Text variant="extraSmall" weight="medium">Rate Limit</Text>
                </div>
                <Text variant="extraSmall" color="muted">
                  Limited to 1 SOL per request. Wait 24 hours between requests if rate limited.
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
                            {lastTransaction.slice(0, 8)}...{lastTransaction.slice(-8)}
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