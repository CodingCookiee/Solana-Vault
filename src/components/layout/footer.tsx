"use client";

import { motion } from "framer-motion";
import {
  Github,
  Twitter,
  Globe,
  Heart,
  ExternalLink,
  Shield,
  Zap,
  Users,
} from "lucide-react";
import { Text } from "@/components/ui/common/text";
import { Button } from "@/components/ui/common/button";

export function Footer() {
  const links = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Security", href: "#security" },
      { name: "Pricing", href: "#pricing" },
    ],
    company: [
      { name: "About", href: "#about" },
      { name: "Blog", href: "#blog" },
      { name: "Careers", href: "#careers" },
      { name: "Contact", href: "#contact" },
    ],
    resources: [
      { name: "Community", href: "#community" },
      { name: "Help Center", href: "#help" },
      { name: "Partners", href: "#partners" },
      { name: "Status", href: "#status" },
    ],
  };

  const socialLinks = [
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/CodingCookiee",
      color: "hover:text-gray-900",
    },
    { name: "Website", icon: Globe, href: "#", color: "hover:text-green-500" },
  ];

  const stats = [
    { label: "Active Users", value: "10K+", icon: Users },
    { label: "Transactions", value: "100K+", icon: Zap },
    { label: "Security Score", value: "99%", icon: Shield },
  ];

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <Text variant="h2" weight="bold" className="mb-1">
                  {stat.value}
                </Text>
                <Text variant="small" color="muted">
                  {stat.label}
                </Text>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 p-2 shadow-lg">
                <svg
                  className="h-full w-full text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <Text variant="h3" weight="bold">
                  SolanaVault
                </Text>
                <Text variant="extraSmall" color="muted">
                  Web3 Wallet Suite
                </Text>
              </div>
            </div>
            <Text variant="body" color="muted" className="mb-6 max-w-sm">
              The most secure and user-friendly way to manage your Solana
              assets. Built for developers, designed for everyone.
            </Text>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors ${social.color} dark:bg-gray-800 dark:text-gray-400`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Sections */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {Object.entries(links).map(
                ([category, categoryLinks], categoryIndex) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Text
                      variant="small"
                      weight="medium"
                      className="mb-4 uppercase tracking-wider"
                    >
                      {category}
                    </Text>
                    <ul className="space-y-3">
                      {categoryLinks.map((link, index) => (
                        <motion.li
                          key={link.name}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <a
                            href={link.href}
                            className="group flex items-center text-gray-600 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
                          >
                            <span className="text-sm">{link.name}</span>
                            <ExternalLink className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 flex items-center justify-end space-y-4 border-t border-gray-200 pt-8 dark:border-gray-800 sm:flex-row sm:space-y-0"
        >
          {/* <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="h-4 w-4 text-red-500" />
            </motion.div>
            <span>for the Solana community</span>
          </div> */}

          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <a
              href="#privacy"
              className="hover:text-gray-900 dark:hover:text-gray-100"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="hover:text-gray-900 dark:hover:text-gray-100"
            >
              Terms of Service
            </a>
            <span>© 2024 SolanaVault. All rights reserved.</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
