"use client";

import { FC, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/common";
import { Text, Button } from "@/components/ui/common";
import { 
  Wallet, 
  ArrowRight, 
  Check, 
  X, 
  Copy, 
  LogOut, 
  Loader2 
} from "lucide-react";
import { toast } from "sonner";

export const WalletConnection: FC = () => {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const { isAuthenticated, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const copyToClipboard = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toBase58());
        setCopied(true);
        toast.success("Address copied to clipboard");
      } catch (err) {
        console.error("Failed to copy address");
        toast.error("Failed to copy address");
      }
    }
  };

  return (
    <Card className="max-w-2xl mx-auto overflow-hidden border border-white/20 dark:border-gray-800/20 backdrop-blur-sm">
      {/* Glowing gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
        <div className="absolute -bottom-8 left-1/2 h-40 w-80 -translate-x-1/2 transform rounded-full bg-purple-500/10 blur-3xl" />
      </div>
      
      <CardHeader className="pb-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle>
            <Text variant="h3" align="center" className="gradient-text">
              Connect Your Wallet
            </Text>
          </CardTitle>
          <CardDescription>
            <Text variant="body" color="muted" align="center" className="max-w-md mx-auto">
              Connect your Solana wallet to access all features and manage your digital assets
            </Text>
          </CardDescription>
        </motion.div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Wallet Connect Button */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-md blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <WalletMultiButton className="!relative !bg-gradient-to-r !from-purple-500 !to-blue-500 !hover:from-purple-600 !hover:to-blue-600 !transition-all !duration-200 !shadow-lg !hover:shadow-xl !text-white !py-3 !px-6 !rounded-md !font-medium" />
          </div>
        </motion.div>

        {/* Connection Status */}
        <AnimatePresence mode="wait">
          {connecting && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm">
                <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
                <Text variant="small" color="warning" weight="medium">
                  Connecting to wallet...
                </Text>
              </div>
            </motion.div>
          )}

          {connected && publicKey && (
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Status Badges */}
              <div className="flex flex-wrap justify-center gap-3">
                <div className="flex items-center space-x-2 rounded-full bg-green-50 dark:bg-green-900/30 px-3 py-1.5 border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Text variant="small" color="success" weight="medium">
                    Wallet Connected
                  </Text>
                </div>
                
                {isAuthenticated && (
                  <div className="flex items-center space-x-2 rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 border border-blue-200 dark:border-blue-800">
                    <Check className="w-3.5 h-3.5 text-blue-500" />
                    <Text variant="small" color="primary" weight="medium">
                      Authenticated
                    </Text>
                  </div>
                )}
              </div>

              {/* Wallet Card */}
              <div className="relative p-0.5 rounded-xl bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-purple-500/40">
                <div className="bg-white dark:bg-gray-900 rounded-[10px] p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                        <Wallet className="h-4 w-4 text-white" />
                      </div>
                      <Text variant="small" weight="medium">
                        Connected Wallet
                      </Text>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <Text variant="extraSmall" color="success">
                        Active
                      </Text>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Address */}
                    <div className="space-y-1.5">
                      <Text variant="small" weight="medium" color="muted">
                        Public Key:
                      </Text>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-50 dark:bg-gray-800/80 p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                          <Text
                            variant="extraSmall"
                            className="font-mono break-all text-gray-800 dark:text-gray-200"
                          >
                            {publicKey.toBase58()}
                          </Text>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyToClipboard}
                          className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Disconnect Button */}
                    <div>
                      <Button 
                        variant="destructive" 
                        onClick={logout} 
                        className="w-full group"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                          <span>Disconnect & Logout</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-start space-x-3">
                      <div className="p-1 bg-green-100 dark:bg-green-800 rounded-full mt-0.5">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <Text variant="small" weight="medium" className="mb-1">
                          You're all set!
                        </Text>
                        <Text variant="extraSmall" color="muted">
                          Your wallet is connected and authenticated. You can now access all features of the application.
                        </Text>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {!connected && !connecting && (
            <motion.div
              key="not-connected"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Not connected message */}
              <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-red-200/50 dark:border-red-800/50 shadow-sm">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-full">
                    <X className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                <Text variant="small" weight="medium" align="center" className="mb-2">
                  Wallet not connected
                </Text>
                <Text 
                  variant="extraSmall" 
                  color="muted" 
                  align="center"
                  className="max-w-sm mx-auto"
                >
                  Please connect your wallet using the button above to access the application features
                </Text>
              </div>

              {/* Features preview */}
              <div className="grid grid-cols-2 gap-3">
                {['Send & Receive', 'Create NFTs', 'Manage Assets', 'View History'].map((feature, i) => (
                  <div 
                    key={feature} 
                    className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200/50 dark:border-gray-700/50 opacity-50"
                  >
                    <div className="flex items-center space-x-2">
                      <ArrowRight className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      <Text variant="extraSmall" color="muted">
                        {feature}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};