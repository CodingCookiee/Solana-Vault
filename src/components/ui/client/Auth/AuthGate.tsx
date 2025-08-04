"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, Button, Text } from "@/components/ui/common";
import {
  Wallet,
  KeyRound,
  Lock,
  ArrowRight,
  Info,
  AlertTriangle,
  Shield,
} from "lucide-react";
import Link from "next/link";

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children, fallback }) => {
  const { isAuthenticated } = useAuth();
  const { connected } = useWallet();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  if (!connected) {
    return (
      fallback || (
        <Card className="max-w-md mx-auto overflow-hidden border border-white/20 dark:border-gray-800/20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 transform h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
          <CardContent className="py-12">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center space-y-7"
            >
              <motion.div variants={itemVariants} className="relative mx-auto">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-50 blur-sm"></div>
                <div className="relative w-20 h-20 mx-auto bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-lg border border-white/50 dark:border-gray-800/50">
                  <Lock className="w-9 h-9 text-blue-600 dark:text-blue-400" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Text
                  variant="h3"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold"
                >
                  Connect Your Wallet
                </Text>
                <Text
                  variant="body"
                  color="muted"
                  align="center"
                  className="max-w-xs mx-auto"
                >
                  A wallet connection is required to access this feature
                </Text>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="max-w-sm mx-auto bg-white/70 dark:bg-gray-800/70 border border-blue-100 dark:border-blue-900/30 rounded-xl p-5 backdrop-blur-sm"
              >
                <div className="flex items-center space-x-3 border-b border-blue-100/50 dark:border-blue-900/20 pb-4 mb-4">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <Text
                    variant="small"
                    weight="semibold"
                    className="text-blue-600 dark:text-blue-400"
                  >
                    How it works
                  </Text>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 mt-0.5">
                      <Wallet className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div>
                      <Text
                        variant="small"
                        weight="medium"
                        className="text-gray-800 dark:text-gray-200"
                      >
                        Connect Wallet
                      </Text>
                      <Text variant="extraSmall" color="muted">
                        Link your Solana wallet securely to the application
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 mt-0.5">
                      <KeyRound className="h-3.5 w-3.5 text-purple-500" />
                    </div>
                    <div>
                      <Text
                        variant="small"
                        weight="medium"
                        className="text-gray-800 dark:text-gray-200"
                      >
                        Verify Ownership
                      </Text>
                      <Text variant="extraSmall" color="muted">
                        Sign a message to prove wallet ownership
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30 mt-0.5">
                      <Shield className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <div>
                      <Text
                        variant="small"
                        weight="medium"
                        className="text-gray-800 dark:text-gray-200"
                      >
                        Access Features
                      </Text>
                      <Text variant="extraSmall" color="muted">
                        Gain full access to all application features
                      </Text>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/connect-wallet">
                  <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl w-full">
                    <span className="relative z-10 flex items-center justify-center">
                      <span>Connect Wallet</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      )
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <Card className="max-w-md mx-auto overflow-hidden border border-white/20 dark:border-gray-800/20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 transform h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
          </div>
          <CardContent className="py-12">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center space-y-7"
            >
              <motion.div variants={itemVariants} className="relative mx-auto">
                <motion.div
                  className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-50 blur-sm"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                ></motion.div>
                <div className="relative w-20 h-20 mx-auto bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-lg border border-white/50 dark:border-gray-800/50">
                  <AlertTriangle className="w-9 h-9 text-amber-500" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Text
                  variant="h3"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-bold"
                >
                  Authentication Needed
                </Text>
                <Text
                  variant="body"
                  color="muted"
                  align="center"
                  className="max-w-xs mx-auto"
                >
                  Please sign a message to verify your wallet ownership
                </Text>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="p-4 mx-auto max-w-sm rounded-xl bg-gradient-to-r from-amber-50/70 to-orange-50/70 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200/50 dark:border-amber-800/50 backdrop-blur-sm"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mt-0.5">
                    <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-left">
                    <Text
                      variant="small"
                      weight="medium"
                      className="mb-1 text-amber-700 dark:text-amber-300"
                    >
                      Verification Required
                    </Text>
                    <Text variant="extraSmall" color="muted">
                      A signature request should appear in your wallet. If not
                      visible, check your wallet notifications or try refreshing
                      the page.
                    </Text>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex space-x-4 justify-center"
              >
                <Link href="/connect-wallet">
                  <Button
                    variant="outline"
                    className="border-amber-200 dark:border-amber-800/70"
                  >
                    Try Again
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost">Back to Home</Button>
                </Link>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      )
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
