"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Card,
  CardContent,
  Button,
  Text,
} from "@/components/ui/common";
import {
  Shield,
  X,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Copy,
  Loader2,
  KeyRound
} from "lucide-react";
import { toast } from "sonner";

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authenticate,
    isAuthenticating,
    authMessage,
  } = useAuth();
  const { publicKey, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  
  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 25
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 30,
      transition: { duration: 0.2 }
    }
  };

  const handleSign = async () => {
    try {
      await authenticate();
      toast.success("Authentication successful!");
    } catch (error) {
      console.error("Authentication failed:", error);
      toast.error("Authentication failed. Please try again.");
    }
  };

  const handleCancel = () => {
    setShowAuthModal(false);
    disconnect();
    toast.info("Authentication canceled");
  };
  
  const handleCopyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toBase58());
        setCopied(true);
        toast.success("Address copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy address");
      }
    }
  };

  if (!showAuthModal) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={() => setShowAuthModal(false)}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md overflow-hidden">
            {/* Decorative top gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
            
            <CardContent className="p-0">
              {/* Header */}
              <div className="relative p-6 pb-4">
                {/* Close button */}
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-4 h-8 w-8 p-0 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-800/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-4 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <Text variant="h4" weight="semibold" className="text-gray-900 dark:text-white mb-1">
                      Verify Wallet Ownership
                    </Text>
                    <Text variant="small" color="muted">
                      Sign a message to authenticate your identity
                    </Text>
                  </div>
                </div>
              </div>
              
              {/* Warning Notice */}
              <div className="px-6 mb-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/70 dark:border-amber-800/50">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-amber-100 dark:bg-amber-800/50 rounded-lg mt-0.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <Text 
                        variant="small" 
                        weight="medium" 
                        className="text-amber-700 dark:text-amber-300 mb-1"
                      >
                        Authentication Required
                      </Text>
                      <Text variant="extraSmall" color="muted">
                        You need to sign a message to authenticate and access all features. 
                        This is secure and your private keys will not be revealed.
                      </Text>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet & Message */}
              <div className="px-6 space-y-5">
                {/* Wallet Address */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Text variant="small" weight="medium" className="text-gray-700 dark:text-gray-300">
                      Connected Wallet
                    </Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="h-7 px-2 py-0 text-xs flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-gray-50/80 dark:bg-gray-800/80 p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                    <Text
                      variant="extraSmall"
                      className="font-mono text-gray-700 dark:text-gray-300 break-all"
                    >
                      {publicKey?.toBase58()}
                    </Text>
                  </div>
                </div>

                {/* Message to sign */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Text variant="small" weight="medium" className="text-gray-700 dark:text-gray-300">
                      Message to Sign
                    </Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMessage(!showMessage)}
                      className="h-7 px-2 py-0 text-xs flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {showMessage ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>Show</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-gray-50/80 dark:bg-gray-800/80 rounded-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                    <AnimatePresence mode="wait">
                      {showMessage ? (
                        <motion.div
                          key="message"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="p-3"
                        >
                          <Text
                            variant="extraSmall"
                            className="font-mono text-gray-700 dark:text-gray-300 break-words"
                          >
                            {authMessage || "Sign this message to verify your wallet ownership."}
                          </Text>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="px-3 py-4 flex justify-center"
                        >
                          <Text variant="extraSmall" color="muted">
                            Click "Show" to view the message
                          </Text>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-8">
                <div className="flex space-x-3">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="default"
                    className="flex-1 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSign}
                    disabled={isAuthenticating}
                    size="default"
                    className="flex-1 relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl border-0"
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      {isAuthenticating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                          <span>Signing...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4 mr-2 text-white" />
                          <span>Sign Message</span>
                        </>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 translate-x-full hover:translate-x-0 transition-transform duration-300"></div>
                  </Button>
                </div>

                {/* Security Notice */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="p-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                      <Shield className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <Text variant="extraSmall" color="muted" align="center">
                      Your private key never leaves your wallet. We only verify your signature.
                    </Text>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};