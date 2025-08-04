"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Menu, X, Sun, Moon, Zap, Coins } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/common/button";
import { Text } from "@/components/ui/common/text";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function Header() {
  const { router } = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { connected, publicKey, disconnect } = useWallet();

  const navigation = [
    { name: "Wallet", href: "#wallet", icon: Wallet },
    { name: "Transactions", href: "#transactions", icon: Zap },
    { name: "Tokens", href: "#tokens", icon: Coins },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-lg dark:bg-gray-900/80"
    >
      <div className="container mx-auto px-4">
        <div
          className="flex h-16 items-center justify-between"
          onClick={() => router.push("/")}
        >
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-xl p-2 shadow-lg bg-gradient-to-r from-purple-300 to-blue-300  ">
                {/* <Wallet className="h-full w-full text-white"/>
                 */}
                <Image
                  src="/favicon.png"
                  alt="Logo"
                  className="h-full w-full object-cover rounded-lg"
                  width={40}
                  height={40}
                />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 shadow-sm animate-pulse" />
            </div>
            <div>
              <Text
                variant="h3"
                weight="bold"
                className="text-gray-900 dark:text-white"
              >
                SolanaVault
              </Text>
              <Text variant="extraSmall" color="muted">
                Web3 Wallet Suite
              </Text>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors hover:text-purple-600 hover:bg-purple-50 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </motion.a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 p-0"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* Wallet Status */}
            {connected && publicKey && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center space-x-2 rounded-lg bg-green-50 px-3 py-1.5 dark:bg-green-900/20"
              >
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <Text
                  variant="extraSmall"
                  weight="medium"
                  className="text-green-700 dark:text-green-400"
                >
                  {publicKey.toString().slice(0, 4)}...
                  {publicKey.toString().slice(-4)}
                </Text>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 py-4 md:hidden dark:border-gray-700"
            >
              <nav className="space-y-2">
                {navigation.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </motion.a>
                ))}

                {connected && publicKey && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navigation.length * 0.1 }}
                    className="flex items-center space-x-3 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <Text
                      variant="small"
                      weight="medium"
                      className="text-green-700 dark:text-green-400"
                    >
                      Connected: {publicKey.toString().slice(0, 8)}...
                      {publicKey.toString().slice(-8)}
                    </Text>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
