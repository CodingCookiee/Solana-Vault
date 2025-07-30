"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "./header";
import { Footer } from "./footer";
import { Toaster } from "@/components/ui/common/sonner";
import {
  Loader2,
  AlertTriangle,
  Wallet,
  ArrowRight,
  ChevronRight,
  LayoutDashboard,
  Bell,
  User,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Text, Button } from "@/components/ui/common";
import { Card, CardContent } from "@/components/ui/common";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function DashboardLayout({
  children,
  title = "Dashboard",
  description = "Manage your Solana assets and transactions",
}: DashboardLayoutProps) {
  const { connected, connecting, publicKey, disconnect } = useWallet();
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Redirect to connect wallet page if not connected
  useEffect(() => {
    if (!connecting && !connected) {
      router.push("/connect-wallet");
    }
  }, [connected, connecting, router]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  // Loading state
  if (connecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm shadow-xl">
              <CardContent className="flex flex-col items-center py-12 px-12">
                <div className="relative mb-6">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-50 blur"></div>
                  <div className="relative rounded-full p-4 bg-white dark:bg-gray-900">
                    <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                  </div>
                </div>

                <Text
                  variant="h4"
                  className="mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold"
                >
                  Connecting to Wallet
                </Text>
                <Text
                  variant="body"
                  color="muted"
                  align="center"
                  className="max-w-xs"
                >
                  Please approve the connection request in your wallet app
                </Text>

                <div className="mt-6 w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (connected && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full"
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400"></div>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="relative mx-auto w-fit">
                    <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-400 to-red-400 opacity-20 blur"></div>
                    <div className="relative p-4 bg-amber-100/50 dark:bg-amber-900/30 rounded-xl">
                      <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>

                  <div>
                    <Text
                      variant="h3"
                      className="mb-2 bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent font-bold"
                    >
                      Authentication Required
                    </Text>
                    <Text
                      variant="body"
                      color="muted"
                      className="max-w-xs mx-auto"
                    >
                      Please complete the wallet verification process to access
                      your dashboard
                    </Text>
                  </div>

                  <div className="p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-800/50 mt-0.5">
                        <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <Text variant="small" color="muted">
                        For your security, we need to verify your wallet
                        ownership with a simple signature
                      </Text>
                    </div>
                  </div>

                  <Link href="/connect-wallet">
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg group border-0">
                      <Wallet className="h-4 w-4 mr-2" />
                      <span>Complete Authentication</span>
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main dashboard layout
  if (!connected || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30">
      <Header />

      <main className="relative">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row mt-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:w-64 shrink-0"
            >
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-800/20 shadow-xl sticky top-24">
                <CardContent className="p-0">
                  {/* Wallet Info */}
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700/30">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <Text variant="small" weight="medium">
                        Your Wallet
                      </Text>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <Text variant="extraSmall" color="success">
                          Connected
                        </Text>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 py-0 text-xs border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-3 w-3 mr-1" />
                        Logout
                      </Button>
                    </div>

                    <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md overflow-hidden">
                      <Text variant="extraSmall" className="font-mono truncate">
                        {publicKey?.toString()}
                      </Text>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="p-2">
                    <nav className="space-y-1">
                      {[
                        {
                          name: "Dashboard",
                          href: "/dashboard",
                          icon: LayoutDashboard,
                        },
                        {
                          name: "Transactions",
                          href: "#transactions",
                          icon: ArrowRight,
                        },
                        { name: "Tokens", href: "#airdrop", icon: Wallet },
                        { name: "NFT Studio", href: "#nfts", icon: Bell },
                        { name: "Security", href: "#", icon: Shield },
                        { name: "Settings", href: "#", icon: Settings },
                        { name: "Help", href: "#", icon: HelpCircle },
                      ].map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-gray-700 transition-colors hover:text-purple-600 hover:bg-purple-50 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20 group"
                        >
                          <div className="flex items-center">
                            <item.icon className="h-4 w-4 mr-3 text-gray-500 group-hover:text-purple-500 dark:text-gray-400 dark:group-hover:text-purple-400" />
                            <span>{item.name}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                        </Link>
                      ))}
                    </nav>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1"
            >
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center mb-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {title}
                  </h1>
                  <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Connected & Authenticated</span>
                    </div>
                  </div>
                </div>
                <Text variant="large" color="muted">
                  {description}
                </Text>
              </div>

              {/* Dashboard Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </div>
  );
}
