"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard";
import { TransactionPanel } from "@/components/ui/client/TransactionPanel/TransactionPanel";
import { AirDrop } from "@/components/ui/client/AirDrop";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Send,
  Download,
  Image,
  Activity,
  ArrowUpRight,
  Wallet,
  CreditCard,
  History,
  TrendingUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/common";
import { Text, Button } from "@/components/ui/common";

export default function DashboardPage() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    if (expandedSection === id) {
      setExpandedSection(null);
    } else {
      setExpandedSection(id);
    }
  };

  const [balance, setBalance] = useState<number | null>(null);
  
  // Fetch balance effect would go here

  const sections = [
    {
      id: "transactions",
      title: "Send & Receive SOL",
      description: "Transfer SOL and manage your transactions",
      icon: Send,
      color: "from-blue-500 to-cyan-500",
      component: <TransactionPanel />,
    },
    {
      id: "airdrop",
      title: "Devnet Token Operations",
      description: "Get test SOL for development and testing purposes",
      icon: Download,
      color: "from-green-500 to-emerald-500",
      component: <AirDrop />,
    },
    
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      description="Manage your Solana assets, transactions, and NFTs"
    >
      {/* Quick Stats */}
      <div className="grid gap-4 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "SOL Balance", value: "0.00", icon: Wallet, change: "+0.05", up: true },
          { title: "NFTs", value: "2", icon: Image, change: "+1", up: true },
          { title: "Transactions", value: "12", icon: CreditCard, change: "+3", up: true },
          { title: "Portfolio Value", value: "$0.00", icon: TrendingUp, change: "+0.00", up: true },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="group"
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Text variant="small" color="muted" className="mb-1">
                      {stat.title}
                    </Text>
                    <Text variant="h3" weight="bold" className="mb-1">
                      {stat.value}
                    </Text>
                    <div className={`flex items-center text-xs ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.up ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                      <span>{stat.change} last 24h</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20">
                    <stat.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Activity Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-10"
      >
        <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 shadow-sm">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <Text variant="h4">Recent Activity</Text>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-8 px-2.5 border-gray-200 dark:border-gray-700">
                <span>View All</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Activity List */}
            <div className="space-y-2">
              {[
                { type: "Transfer", amount: "0.05 SOL", date: "2 hours ago", address: "Df52...k4GZ" },
                { type: "Airdrop", amount: "0.5 SOL", date: "Yesterday", address: "System Program" },
              ].map((activity, i) => (
                <div 
                  key={i}
                  className="p-3 border border-gray-100 dark:border-gray-800/50 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <ArrowUpRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <Text variant="small" weight="medium">
                        {activity.type}
                      </Text>
                      <Text variant="extraSmall" color="muted">
                        {activity.date}
                      </Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text variant="small" weight="medium">
                      {activity.amount}
                    </Text>
                    <Text variant="extraSmall" color="muted">
                      {activity.address}
                    </Text>
                  </div>
                </div>
              ))}
              
              {/* Empty State */}
              {/* 
              <div className="py-8 text-center">
                <Text variant="small" color="muted">
                  No recent activity to display
                </Text>
              </div> 
              */}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expandable Sections */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            id={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index + 0.4 }}
          >
            <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
              {/* Section Header */}
              <Button
                variant="ghost"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color} shadow-sm`}>
                    <section.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <Text variant="h4" weight="medium">
                      {section.title}
                    </Text>
                    <Text variant="small" color="muted">
                      {section.description}
                    </Text>
                  </div>
                </div>
                <div className="shrink-0">
                  {expandedSection === section.id ? 
                    <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  }
                </div>
              </Button>
              
              {/* Section Content */}
              {expandedSection === section.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="border-t border-gray-100 dark:border-gray-800/50 p-4">
                    {section.component}
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </DashboardLayout>
  );
}