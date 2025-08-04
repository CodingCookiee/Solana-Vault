"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  Shield,
  Zap,
  Coins,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  TrendingUp,
  Users,
  Lock,
  Globe,
  ExternalLink,
} from "lucide-react";
import { Text, Button } from "@/components/ui/common";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/common/sonner";
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
      ease: "easeOut",
    },
  },
};

const features = [
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description:
      "Multi-layer encryption and secure key management for your digital assets.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Execute transactions in milliseconds with Solana's high-performance blockchain.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Coins,
    title: "Multi-Token Support",
    description:
      "Manage SOL and SPL tokens seamlessly in one unified interface.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Globe,
    title: "Cross-Platform",
    description:
      "Access your wallet anywhere with our responsive web application.",
    gradient: "from-purple-500 to-pink-500",
  },
];

const stats = [
  { label: "Active Users", value: "50K+", icon: Users },
  { label: "Total Transactions", value: "2M+", icon: TrendingUp },
  { label: "Security Rating", value: "AAA+", icon: Lock },
  { label: "Uptime", value: "99.9%", icon: CheckCircle },
];

const testimonials = [
  {
    name: "Alex Chen",
    role: "DeFi Developer",
    content:
      "The most intuitive Solana wallet interface I've ever used. Perfect for both beginners and advanced users.",
    avatar: "AC",
  },
  {
    name: "Sarah Johnson",
    role: "NFT Artist",
    content:
      "Creating and managing NFTs has never been easier. The built-in NFT studio is a game-changer.",
    avatar: "SJ",
  },
  {
    name: "Mike Rodriguez",
    role: "Crypto Trader",
    content:
      "Lightning-fast transactions and real-time balance updates. This is how Web3 should feel.",
    avatar: "MR",
  },
];

export default function Home() {
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
            <div className="absolute right-1/4 top-1/3">
              <motion.div
                animate={{
                  x: [0, 20, 0],
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-64 w-64 rounded-full bg-gradient-to-r from-pink-500/20 to-yellow-500/20 blur-3xl"
              />
            </div>
          </div>

          <div className="container mx-auto px-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mx-auto max-w-4xl text-center"
            >
              <motion.div variants={itemVariants} className="mb-8">
                <div className="mx-auto mb-6 flex w-fit items-center space-x-2 rounded-full bg-white/50 px-4 py-2 backdrop-blur-sm dark:bg-gray-800/50">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <Text
                    variant="small"
                    weight="medium"
                    className="text-purple-600 dark:text-purple-400"
                  >
                    Next-Generation Web3 Wallet
                  </Text>
                </div>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="mb-6 bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 bg-clip-text text-5xl font-bold leading-tight text-transparent dark:from-white dark:via-purple-200 dark:to-blue-200 lg:text-7xl"
              >
                Your Gateway to{" "}
                <span className="relative">
                  Solana
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-blue-500"
                  />
                </span>
              </motion.h1>

              <motion.div variants={itemVariants} className="mb-8">
                <Text
                  variant="large"
                  color="muted"
                  align="center"
                  className="mx-auto max-w-2xl leading-relaxed"
                >
                  Securely manage your SOL and SPL tokens, create NFTs, execute
                  lightning-fast transactions, and explore the Solana ecosystem
                  with our intuitive wallet interface.
                </Text>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mb-12 flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0"
              >
                <Link href="/connect-wallet">
                  <Button
                    size="lg"
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 shadow-lg hover:shadow-xl"
                  >
                    <motion.span
                      className="relative z-10 flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Wallet className="h-5 w-5" />
                      <span>Connect Wallet</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="px-8 py-4">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Demo
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 gap-6 sm:grid-cols-4"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.8 }}
                    className="group"
                  >
                    <div className="text-center w-full flex flex-col items-center space-y-2 rounded-lg shadow-sm backdrop-blur-sm">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 p-2 group-hover:shadow-lg dark:from-purple-900/30 dark:to-blue-900/30">
                        <stat.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <Text variant="h3" weight="bold" className="mb-1">
                        {stat.value}
                      </Text>
                      <Text variant="small" color="muted">
                        {stat.label}
                      </Text>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl text-center mb-16"
            >
              <Text variant="h2" weight="bold" className="mb-4">
                Why Choose SolanaVault?
              </Text>
              <Text variant="large" color="muted">
                Built with cutting-edge technology and designed for the modern
                crypto user
              </Text>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/50 p-6 backdrop-blur-sm transition-all hover:shadow-xl dark:border-gray-800/20 dark:bg-gray-800/50"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-5`}
                  />

                  <div
                    className={`mb-4 inline-flex rounded-xl bg-gradient-to-r ${feature.gradient} p-3 shadow-lg`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>

                  <Text variant="h4" weight="medium" className="mb-3">
                    {feature.title}
                  </Text>

                  <Text variant="body" color="muted">
                    {feature.description}
                  </Text>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl text-center mb-16"
            >
              <Text variant="h2" weight="bold" className="mb-4">
                Loved by Developers & Users
              </Text>
              <Text variant="large" color="muted">
                See what the community is saying about SolanaVault
              </Text>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 p-6 backdrop-blur-sm dark:border-gray-800/20 dark:bg-gray-800/80"
                >
                  <div className="mb-4 flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>

                  <Text variant="body" className="mb-6 italic">
                    "{testimonial.content}"
                  </Text>

                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-sm font-medium text-white">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <Text variant="small" weight="medium">
                        {testimonial.name}
                      </Text>
                      <Text variant="extraSmall" color="muted">
                        {testimonial.role}
                      </Text>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl text-center"
            >
              <Text variant="h2" weight="bold" className="mb-6">
                Ready to Start Your Solana Journey?
              </Text>
              <Text variant="large" color="muted" className="mb-8">
                Join thousands of users who trust SolanaVault with their digital
                assets
              </Text>
              <Link href="/connect-wallet">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 shadow-lg hover:shadow-xl"
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Get Started Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
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
