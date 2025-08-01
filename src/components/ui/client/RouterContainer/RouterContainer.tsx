"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Text,
} from "@/components/ui/common";
import {
  MessageSquare,
  Repeat,
  FileSearch,
  Database,
  Coins,
  Image,
  ArrowUpRight,
  Search,
  ChevronRight,
  Star,
  Zap,
  Share2,
  Code,
  Lock,
  PenTool
} from "lucide-react";
import Link from "next/link";

interface ProgramCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  gradient: string;
  comingSoon?: boolean;
  popular?: boolean;
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  title,
  description,
  icon: Icon,
  link,
  gradient,
  comingSoon = false,
  popular = false
}) => {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.97 }}
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card 
        className={`h-full border border-white/20 dark:border-gray-800/20 backdrop-blur-sm overflow-hidden relative ${comingSoon ? 'opacity-70' : 'cursor-pointer'}`}
        onClick={() => !comingSoon && router.push(link)}
      >
        {/* Gradient top accent */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`}></div>
        
        {popular && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <Star className="h-3 w-3 mr-1" fill="white" />
            <span>Popular</span>
          </div>
        )}
        
        {comingSoon && (
          <div className="absolute top-3 right-3 bg-gray-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
            Coming Soon
          </div>
        )}
        
        <CardContent className="p-5 pt-7">
          <div className="flex flex-col h-full">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-sm mb-4 w-fit`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            
            <Text variant="h4" className="mb-2 font-medium">
              {title}
            </Text>
            
            <Text variant="small" color="muted" className="mb-5">
              {description}
            </Text>
            
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/30">
              <Text variant="extraSmall" color="muted" className="flex items-center">
                <Code className="h-3.5 w-3.5 mr-1.5" />
                {comingSoon ? "In Development" : "Ready to use"}
              </Text>
              
              {!comingSoon && (
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <span>Open</span>
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const RouterContainer: React.FC = () => {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  
  const programs = [
    {
      title: "Memo Program",
      description: "Write permanent messages on the Solana blockchain",
      icon: MessageSquare,
      link: "/memo",
      gradient: "from-blue-500 to-indigo-500",
      popular: true
    },
    {
      title: "Transfer SOL",
      description: "Send SOL tokens to other Solana wallet addresses",
      icon: Repeat,
      link: "/transfer-sol",
      gradient: "from-green-500 to-emerald-500",
      popular: true
    },
    {
      title: "Account Reader",
      description: "Explore and inspect Solana account data on-chain",
      icon: FileSearch,
      link: "/account-reader",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      title: "CRUD Operations",
      description: "Create, read, update, and delete data on Solana",
      icon: Database,
      link: "/crud",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      title: "SPL Token",
      description: "Manage SPL tokens and token accounts",
      icon: Coins,
      link: "/spl",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      title: "NFT Studio",
      description: "Create, mint, and manage NFTs on Solana",
      icon: Image,
      link: "/nft",
      gradient: "from-pink-500 to-purple-500",
      popular: true
    },
    {
      title: "Multisig Vault",
      description: "Create secure multisignature vault accounts",
      icon: Lock,
      link: "/multisig",
      gradient: "from-slate-500 to-gray-500",
      comingSoon: true
    },
    {
      title: "Transaction Builder",
      description: "Create and send complex custom transactions",
      icon: PenTool,
      link: "/tx-builder",
      gradient: "from-red-500 to-rose-500",
      comingSoon: true
    }
  ];

  const filteredPrograms = searchQuery 
    ? programs.filter(program => 
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        program.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : programs;

  // Show loading state if wallet is not ready
  if (!wallet.connected) {
    return (
      <AuthGate>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <Text variant="h5" color="muted">
              Please connect your wallet to interact with Solana programs
            </Text>
          </CardContent>
        </Card>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="space-y-6">
        {/* Header */}
        <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
          <CardHeader className="pb-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardTitle>
                <Text variant="h3" className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Solana Programs
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="body" color="muted">
                  Interact with various Solana programs and explore blockchain functionality
                </Text>
              </CardDescription>
            </motion.div>
            
            {/* Search Bar */}
            <div className="mt-4 relative">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 px-3 py-2">
                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                <input 
                  type="text"
                  placeholder="Search programs..."
                  className="bg-transparent w-full outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Program Categories */}
          <CardContent className="pb-6">
            <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 py-1">
              {['All', 'Popular', 'Transactions', 'Data', 'Tokens', 'NFTs'].map((category, i) => (
                <Button 
                  key={category}
                  size="sm" 
                  variant={i === 0 ? "default" : "outline"}
                  className={`whitespace-nowrap text-xs h-8 px-3 ${i === 0 ? "bg-gradient-to-r from-purple-600 to-blue-600 border-0" : "border-gray-200 dark:border-gray-700"}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredPrograms.map((program, index) => (
              <ProgramCard
                key={program.title}
                title={program.title}
                description={program.description}
                icon={program.icon}
                link={program.link}
                gradient={program.gradient}
                comingSoon={program.comingSoon}
                popular={program.popular}
              />
            ))}
          </AnimatePresence>
        </div>
        
        {/* No Results */}
        {filteredPrograms.length === 0 && (
          <Card className="py-12 text-center border border-dashed border-gray-200 dark:border-gray-700 bg-transparent">
            <CardContent>
              <Text variant="body" color="muted">
                No programs found matching your search. Try a different query.
              </Text>
            </CardContent>
          </Card>
        )}
        
        {/* Knowledge Base Link */}
        <div className="mt-8">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 shadow-md">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Text variant="h4" weight="semibold" className="mb-1">
                    Want to learn more about Solana development?
                  </Text>
                  <Text variant="body" color="muted">
                    Check out our knowledge base for tutorials, examples and documentation.
                  </Text>
                </div>
              </div>
              <Button className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-sm hover:from-purple-700 hover:to-blue-700 transition-colors border-0">
                <span>Learn More</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 sm:hidden">
              <Button className="w-full items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-sm hover:from-purple-700 hover:to-blue-700 transition-colors border-0">
                <span>Learn More</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
};

export default RouterContainer;