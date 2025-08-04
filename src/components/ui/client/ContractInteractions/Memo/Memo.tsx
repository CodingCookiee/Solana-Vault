"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Text,
} from "@/components/ui/common";
import {
  FileText,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  X,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface MemoProps {
  memoText: string;
  setMemoText: (text: string) => void;
  handleSendMemo: () => void;
  memoService: {
    loading: boolean;
    error: string | null;
    clearError: () => void;
    validateMessage: (text: string) => { valid: boolean; error?: string };
  };
  isLoading: boolean;
  status: string;
  setStatus: (status: string) => void;
  lastTransaction?: string;
}

export const Memo: React.FC<MemoProps> = ({
  memoText,
  setMemoText,
  handleSendMemo,
  memoService,
  isLoading,
  status,
  setStatus,
  lastTransaction,
}) => {
  const validation = memoService.validateMessage(memoText);
  const charCount = memoText.length;
  const maxChars = 566; // Solana memo program limit

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatAddress = (address: string) => {
    if (address.length < 8) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >

       {/* Back to Dashboard */}
        <div className="flex justify-between items-center">
          <Link href="/dashboard">
            <Button
              // onClick={() => window.history.back()}
              variant="outline"
              className="mb-4 text-sm font-medium flex items-center gap-2  border-green-200 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
        
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>
                <Text variant="h5" className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                  Memo Program
                </Text>
              </CardTitle>
              <CardDescription>
                <Text variant="small" color="muted">
                  Send a permanent message to the Solana blockchain
                </Text>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Memo Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block">
                <Text variant="small" weight="medium" color="default">
                  Memo Message
                </Text>
              </label>
              <div className="flex items-center space-x-2">
                <Text 
                  variant="extraSmall" 
                  color={charCount > maxChars * 0.8 ? "warning" : "muted"}
                  className="font-mono"
                >
                  {charCount}/{maxChars}
                </Text>
                {charCount > maxChars * 0.8 && (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
            
            <div className="relative">
              <textarea
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
                placeholder="Enter your memo message... This will be permanently stored on the blockchain."
                className={`w-full p-4 border rounded-lg text-sm transition-all duration-200 resize-none ${
                  memoText && !validation.valid
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 dark:border-red-700"
                    : memoText && validation.valid
                    ? "border-green-300 bg-green-50 dark:bg-green-900/20 focus:ring-green-500 dark:border-green-700"
                    : "border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500"
                } focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800`}
                rows={4}
                maxLength={maxChars}
              />
              
              {/* Character count indicator */}
              <div className="absolute bottom-3 right-3">
                <div className={`w-8 h-1 rounded-full ${
                  charCount === 0 ? 'bg-gray-200 dark:bg-gray-700' :
                  charCount / maxChars < 0.5 ? 'bg-green-400' :
                  charCount / maxChars < 0.8 ? 'bg-yellow-400' :
                  'bg-red-400'
                }`} style={{ width: `${Math.max(8, (charCount / maxChars) * 32)}px` }}></div>
              </div>
            </div>

            {/* Validation Feedback */}
            <AnimatePresence>
              {memoText && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {validation.valid ? (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <Text variant="extraSmall" className="text-green-800 dark:text-green-200 font-medium">
                        Valid memo message ready to send
                      </Text>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <Text variant="extraSmall" className="text-red-800 dark:text-red-200">
                        {validation.error}
                      </Text>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Panel */}
            {!memoText && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-800/50 mt-0.5">
                    <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <Text variant="small" weight="medium" className="text-green-800 dark:text-green-200">
                      About Memo Program
                    </Text>
                    <Text variant="extraSmall" className="text-green-700 dark:text-green-300">
                      Messages are permanently stored on-chain • Maximum 566 characters • 
                      Visible to everyone • Perfect for timestamps, notes, or proof of existence
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMemo}
            disabled={isLoading || !validation.valid || memoService.loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg group border-0"
            size="lg"
          >
            {isLoading || memoService.loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending to Blockchain...</span>
              </div>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Send Memo to Blockchain</span>
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          {/* Transaction Fee Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <Text variant="extraSmall" weight="medium">Transaction Details</Text>
            </div>
            <Text variant="extraSmall" color="muted">
              Network fee: ~0.000005 SOL • Program: Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo • Permanent storage
            </Text>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      <AnimatePresence>
        {memoService.error && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <Card className="border-red-200 dark:border-red-800 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-400 to-pink-400"></div>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30 mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <Text variant="small" weight="medium" className="text-red-800 dark:text-red-200 mb-1">
                      Transaction Error
                    </Text>
                    <Text variant="extraSmall" className="text-red-700 dark:text-red-300">
                      {memoService.error}
                    </Text>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={memoService.clearError}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Display */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <Card className={`overflow-hidden ${
              status.includes("❌")
                ? "border-red-200 dark:border-red-800"
                : status.includes("✅")
                ? "border-green-200 dark:border-green-800"
                : "border-blue-200 dark:border-blue-800"
            }`}>
              <div className={`h-1 ${
                status.includes("❌")
                  ? "bg-gradient-to-r from-red-400 to-pink-400"
                  : status.includes("✅")
                  ? "bg-gradient-to-r from-green-400 to-emerald-400"
                  : "bg-gradient-to-r from-blue-400 to-purple-400"
              }`}></div>
              
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-1.5 rounded-full mt-0.5 ${
                    status.includes("❌")
                      ? "bg-red-100 dark:bg-red-900/30"
                      : status.includes("✅")
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-blue-100 dark:bg-blue-900/30"
                  }`}>
                    {status.includes("❌") ? (
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    ) : status.includes("✅") ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <Text variant="small" weight="medium" className={
                      status.includes("❌")
                        ? "text-red-800 dark:text-red-200"
                        : status.includes("✅")
                        ? "text-green-800 dark:text-green-200"
                        : "text-blue-800 dark:text-blue-200"
                    }>
                      Memo Status
                    </Text>
                    
                    <Text variant="extraSmall" color="muted" className="break-all">
                      {status}
                    </Text>

                    {/* Transaction Hash Display */}
                    {lastTransaction && status.includes("✅") && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Text variant="extraSmall" color="muted">
                          Transaction:
                        </Text>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                          {formatAddress(lastTransaction)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(lastTransaction)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://explorer.solana.com/tx/${lastTransaction}?cluster=devnet`, '_blank')}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatus("")}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};