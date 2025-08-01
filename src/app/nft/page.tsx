"use client";

import { NFTContainer } from "@/components/ui/client/nft/NFTContainer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Text,
} from "@/components/ui/common";
import { Palette } from "lucide-react";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/common";

export default function NFTPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl mx-auto space-y-8"
        >

          <main>
            <NFTContainer />
          </main>
        </motion.div>
      </div>
    </div>
  );
}
