"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/contexts/AuthContext";
import { WalletConnection } from "@/components/ui/client/WalletConnect/WalletConnection";
import { AuthFlowInfo } from "@/components/ui/client/Auth/AuthFlowInfo";
import { AuthModal } from "@/components/ui/client/Auth/AuthModal";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft, Shield, Zap } from "lucide-react";
import { Text, Button } from "@/components/ui/common";
import Link from "next/link";

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

export default function ConnectWalletPage() {
  const { connected } = useWallet();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already connected and authenticated
  useEffect(() => {
    if (connected && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [connected, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30">
      <Header />

      <main className="relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 transform">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="h-96 w-96 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl"
              />
            </div>
          </div>

          <div className="container mx-auto px-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mx-auto max-w-4xl"
            >
              {/* Back Button */}
              <motion.div variants={itemVariants} className="mb-8">
                <Link href="/">
                  <Button variant="ghost" className="group mb-8">
                    <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                  </Button>
                </Link>
              </motion.div>

              {/* Page Title */}
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h1 className="mb-6 bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 bg-clip-text text-4xl font-bold leading-tight text-transparent dark:from-white dark:via-purple-200 dark:to-blue-200 lg:text-6xl">
                  Connect Your Wallet
                </h1>
                <Text
                  variant="body"
                  color="muted"
                  align="center"
                  className="mx-auto max-w-2xl leading-relaxed"
                >
                  Securely connect your Solana wallet to access all features and
                  start managing your digital assets.
                </Text>
              </motion.div>

              {/* Security Features */}
              <motion.div
                variants={itemVariants}
                className="grid gap-6 md:grid-cols-2 mb-12 max-w-2xl mx-auto"
              >
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <Text variant="small" weight="medium" className="mb-1">
                      Secure Authentication
                    </Text>
                    <Text variant="extraSmall" color="muted">
                      Your private keys never leave your wallet
                    </Text>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <Text variant="small" weight="medium" className="mb-1">
                      Instant Access
                    </Text>
                    <Text variant="extraSmall" color="muted">
                      Connect once and access all features immediately
                    </Text>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Connection Flow */}
        <section className="container mx-auto px-4 pb-20 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AuthFlowInfo />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <WalletConnection />
          </motion.div>
        </section>
      </main>

      <Footer />
      <AuthModal />
      
    </div>
  );
}
