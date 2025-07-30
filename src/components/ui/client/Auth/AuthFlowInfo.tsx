"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Link,
  Wallet,
  PenTool,
  CheckSquare,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Text, Button } from "@/components/ui/common";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common";

export const AuthFlowInfo: React.FC = () => {
  const { connected } = useWallet();
  const { isAuthenticated } = useAuth();

  const steps = [
    {
      title: "Connect Wallet",
      description: "Link your Solana wallet to the application",
      icon: Wallet,
      status: connected ? "completed" : "pending",
    },
    {
      title: "Sign Message",
      description: "Verify ownership with a signature",
      icon: PenTool,
      status: !connected ? "locked" : isAuthenticated ? "completed" : "active",
    },
    {
      title: "Access Features",
      description: "Use all application features",
      icon: CheckSquare,
      status: !connected || !isAuthenticated ? "locked" : "completed",
    },
  ];

  return (
    <Card className="max-w-3xl mx-auto backdrop-blur-sm border border-white/20 dark:border-gray-800/20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-12 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <CardHeader className="pb-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <CardTitle>
            <Text
              variant="h3"
              className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              Authentication Process
            </Text>
          </CardTitle>
          <Text variant="small" color="muted" className="max-w-md mx-auto">
            Follow these steps to securely connect your wallet and access all
            features
          </Text>
        </motion.div>
      </CardHeader>

      <CardContent className="py-8">
        {/* Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-10 left-[45px] right-[45px] h-0.5 bg-gray-200 dark:bg-gray-700">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500"
              initial={{ width: "0%" }}
              animate={{
                width:
                  connected && isAuthenticated
                    ? "100%"
                    : connected
                    ? "50%"
                    : "0%",
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative z-10"
              >
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 relative ${
                      step.status === "completed"
                        ? "bg-gradient-to-r from-purple-500 to-blue-500"
                        : step.status === "active"
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                        : step.status === "pending"
                        ? "bg-gradient-to-r from-blue-400 to-blue-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{
                      scale: 1,
                      opacity: step.status === "locked" ? 0.5 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <step.icon
                      className={`h-8 w-8 ${
                        step.status === "locked"
                          ? "text-gray-400 dark:text-gray-600"
                          : "text-white"
                      }`}
                    />

                    {step.status === "completed" && (
                      <motion.div
                        className="absolute -right-1 -bottom-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-900"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          delay: 0.2,
                        }}
                      >
                        <CheckCircle className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </motion.div>

                  <Text
                    variant="small"
                    weight="semibold"
                    className={
                      step.status === "completed"
                        ? "text-purple-600 dark:text-purple-400"
                        : step.status === "active"
                        ? "text-amber-600 dark:text-amber-400"
                        : step.status === "pending"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-600"
                    }
                  >
                    {step.title}
                  </Text>

                  <Text
                    variant="extraSmall"
                    color="muted"
                    className={`max-w-[150px] mx-auto mt-1 ${
                      step.status === "locked" ? "opacity-50" : ""
                    }`}
                  >
                    {step.description}
                  </Text>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Status Message */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {!connected && (
              <motion.div
                key="not-connected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 inline-flex items-center space-x-2 mx-auto"
              >
                <ArrowRight className="h-4 w-4 text-blue-500" />
                <Text variant="small" color="primary">
                  Connect your wallet to start the authentication process
                </Text>
              </motion.div>
            )}

            {connected && !isAuthenticated && (
              <motion.div
                key="not-authenticated"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 inline-flex items-center space-x-2 mx-auto"
              >
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <Text variant="small" color="warning">
                  Sign the authentication message to continue
                </Text>
              </motion.div>
            )}

            {connected && isAuthenticated && (
              <motion.div
                key="authenticated"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 inline-flex items-center space-x-2 mx-auto"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Text variant="small" color="success">
                  Authentication complete! You have access to all features
                </Text>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  );
};
