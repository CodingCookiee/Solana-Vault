"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Text,
  Card,
  CardContent,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/common";
import type { CreatedToken } from "@/services/spl-tokens";
import {
  Coins,
  Wallet,
  Crown,
  ExternalLink,
  Copy,
  Zap,
  Trash2,
  Plus,
  AlertTriangle,
  Loader2,
  History,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface TokenHistoryItemProps {
  token: CreatedToken;
  index: number;
  publicKey?: string;
  activeHistoryTab: "created" | "owned";
  onSelect: (mintAddress: string) => void;
  onClose: (mintAddress: string, tokenName: string) => void;
  closeLoading: boolean;
  isSelected: boolean; // New prop to track if the token is selected}
}

const TokenAvatar: React.FC<{ token: CreatedToken }> = ({ token }) => (
  <div className="relative">
    {token.imageUrl ? (
      <img
        src={token.imageUrl}
        alt={token.name}
        className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 dark:border-purple-700"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          e.currentTarget.nextElementSibling?.classList.remove("hidden");
        }}
      />
    ) : null}
    <div
      className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
        token.imageUrl ? "hidden" : ""
      }`}
    >
      {token.symbol?.charAt(0) || "T"}
    </div>
  </div>
);

const TokenHeader: React.FC<{
  token: CreatedToken;
  activeHistoryTab: "created" | "owned";
  publicKey?: string;
}> = ({ token, activeHistoryTab, publicKey }) => (
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center space-x-3">
      <div className="relative">
        <TokenAvatar token={token} />
        {activeHistoryTab === "created" &&
          token.mintAuthority === publicKey && (
            <div className="absolute -top-1 -right-1 p-1 bg-yellow-500 rounded-full">
              <Crown className="h-3 w-3 text-white" />
            </div>
          )}
      </div>

      <div className="flex-1 min-w-0">
        <Text variant="h5" weight="bold" className="truncate">
          {token.name || "Unknown Token"}
        </Text>
        <div className="flex items-center space-x-3 mt-1">
          <Text variant="small" color="muted">
            {token.symbol || "N/A"} • {token.decimals} decimals
          </Text>
          {activeHistoryTab === "created" &&
            token.mintAuthority === publicKey && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm">
                <Crown className="h-3 w-3 mr-1" />
                Mint Authority
              </span>
            )}
        </div>
      </div>
    </div>
  </div>
);

const TokenStats: React.FC<{ token: CreatedToken }> = ({ token }) => (
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
      <div className="flex items-center space-x-2 mb-1">
        <Coins className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        <Text
          variant="extraSmall"
          weight="medium"
          className="text-purple-800 dark:text-purple-200"
        >
          Total Supply
        </Text>
      </div>
      <Text
        variant="small"
        weight="bold"
        className="text-purple-700 dark:text-purple-300"
      >
        {token.totalSupply.toLocaleString()} {token.symbol}
      </Text>
    </div>

    {token.userBalance !== undefined && (
      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
        <div className="flex items-center space-x-2 mb-1">
          <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
          <Text
            variant="extraSmall"
            weight="medium"
            className="text-green-800 dark:text-green-200"
          >
            Your Balance
          </Text>
        </div>
        <Text
          variant="small"
          weight="bold"
          className="text-green-700 dark:text-green-300"
        >
          {token.userBalance.toLocaleString()} {token.symbol}
        </Text>
      </div>
    )}
  </div>
);

const TokenDetails: React.FC<{ token: CreatedToken }> = ({ token }) => {
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <>
      {/* Mint Address */}
      <div className="mb-4">
        <Text
          variant="extraSmall"
          weight="medium"
          color="muted"
          className="mb-2 uppercase tracking-wide"
        >
          Mint Address
        </Text>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <Text variant="extraSmall" className="font-mono break-all pr-2">
            {token.mintAddress}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              copyToClipboard(token.mintAddress, "Address copied to clipboard!")
            }
            className="h-6 w-6 p-0 shrink-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Metadata URI */}
      {token.metadata?.uri && (
        <div className="mb-4">
          <Text
            variant="extraSmall"
            weight="medium"
            color="muted"
            className="mb-2 uppercase tracking-wide"
          >
            Metadata URI
          </Text>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <Text variant="extraSmall" className="break-all pr-2">
              {token.metadata.uri}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(token.metadata.uri, "_blank")}
              className="h-6 w-6 p-0 shrink-0"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Creation Date */}
      {token.createdAt && (
        <div className="mb-4">
          <Text
            variant="extraSmall"
            color="muted"
            className="flex items-center space-x-2"
          >
            <History className="h-3 w-3" />
            <span>
              Created on {new Date(token.createdAt).toLocaleDateString()}
            </span>
          </Text>
        </div>
      )}
    </>
  );
};

const BalanceWarning: React.FC<{ token: CreatedToken }> = ({ token }) => {
  if (!token.userBalance || token.userBalance <= 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <Text
                variant="small"
                weight="medium"
                className="text-amber-800 dark:text-amber-200"
              >
                Active Balance: {token.userBalance.toLocaleString()}{" "}
                {token.symbol}
              </Text>
              <Text
                variant="extraSmall"
                className="text-amber-700 dark:text-amber-300 mt-1"
              >
                Transfer or burn tokens before closing the account
              </Text>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const TokenActions: React.FC<{
  token: CreatedToken;
  activeHistoryTab: "created" | "owned";
  publicKey?: string;
  onSelect: (mintAddress: string) => void;
  onClose: (mintAddress: string, tokenName: string) => void;
  closeLoading: boolean;
  isSelected: boolean;
}> = ({
  token,
  activeHistoryTab,
  publicKey,
  onSelect,
  onClose,
  closeLoading,
  isSelected,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const formatAddress = (address: string) => {
    if (address.length < 8) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const handleCloseConfirm = () => {
    setIsDialogOpen(false);
    onClose(token.mintAddress, token.name || "Unknown Token");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() => {
          // Only call onSelect if the token isn't already selected
          if (!isSelected) {
            onSelect(token.mintAddress);
            // toast.success("Token selected for operations");
          }
        }}
        variant="outline"
        size="sm"
        className={`border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20 ${
          isSelected ? "bg-purple-50 dark:bg-purple-900/20" : ""
        }`}
      >
        <Zap className="h-3 w-3 mr-1" />
        {isSelected ? "Selected" : "Use Token"}
      </Button>

      <Button
        onClick={() =>
          window.open(
            `https://explorer.solana.com/address/${token.mintAddress}?cluster=devnet`,
            "_blank"
          )
        }
        variant="outline"
        size="sm"
        className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
      >
        <ExternalLink className="h-3 w-3 mr-1" />
        Explorer
      </Button>

      <Button
        onClick={() =>
          copyToClipboard(token.mintAddress, "Token address copied!")
        }
        variant="outline"
        size="sm"
        className="border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900/20"
      >
        <Copy className="h-3 w-3 mr-1" />
        Copy
      </Button>

      {activeHistoryTab === "created" && token.mintAuthority === publicKey && (
        <Button
          onClick={() => {
            onSelect(token.mintAddress);
            document
              .getElementById("mint-section")
              ?.scrollIntoView({ behavior: "smooth" });
            toast.info("Scrolled to mint section");
          }}
          variant="outline"
          size="sm"
          className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
        >
          <Plus className="h-3 w-3 mr-1" />
          Mint More
        </Button>
      )}

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            disabled={closeLoading}
          >
            {closeLoading ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3 mr-1" />
            )}
            {activeHistoryTab === "created" ? "Remove" : "Close Account"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>
                {activeHistoryTab === "created"
                  ? "Remove Token from List"
                  : "Close Token Account"}
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                {activeHistoryTab === "created"
                  ? `Are you sure you want to remove "${
                      token.name || "Unknown Token"
                    }" from your created tokens list?`
                  : `Are you sure you want to close the token account for "${
                      token.name || "Unknown Token"
                    }"?`}
              </p>

              {activeHistoryTab === "created" ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-2">
                    <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <Text
                        variant="small"
                        weight="medium"
                        className="text-blue-800 dark:text-blue-200"
                      >
                        Note: This only removes the token from your local list
                      </Text>
                      <Text
                        variant="extraSmall"
                        className="text-blue-700 dark:text-blue-300 mt-1"
                      >
                        The actual token on the blockchain will not be affected.
                        You can re-add it later using the mint address.
                      </Text>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <Text
                          variant="small"
                          weight="medium"
                          className="text-amber-800 dark:text-amber-200"
                        >
                          Warning: Make sure your balance is 0 first
                        </Text>
                        <Text
                          variant="extraSmall"
                          className="text-amber-700 dark:text-amber-300 mt-1"
                        >
                          You cannot close an account with tokens still in it.
                          Transfer or burn all tokens first.
                        </Text>
                      </div>
                    </div>
                  </div>

                  {token.userBalance && token.userBalance > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start space-x-2">
                        <X className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                          <Text
                            variant="small"
                            weight="medium"
                            className="text-red-800 dark:text-red-200"
                          >
                            Current Balance:{" "}
                            {token.userBalance.toLocaleString()} {token.symbol}
                          </Text>
                          <Text
                            variant="extraSmall"
                            className="text-red-700 dark:text-red-300 mt-1"
                          >
                            This operation will fail. Please transfer or burn
                            your tokens first.
                          </Text>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <Text variant="extraSmall" color="muted" className="font-mono">
                  {formatAddress(token.mintAddress)}
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(token.mintAddress, "Address copied!")
                  }
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseConfirm}
              className={
                activeHistoryTab === "created"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-red-500 hover:bg-red-600"
              }
            >
              {activeHistoryTab === "created"
                ? "Remove from List"
                : "Close Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const TokenHistoryItem: React.FC<TokenHistoryItemProps> = ({
  token,
  index,
  publicKey,
  activeHistoryTab,
  onSelect,
  onClose,
  closeLoading,
  isSelected,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>

        <CardContent className="p-6">
          <TokenHeader
            token={token}
            activeHistoryTab={activeHistoryTab}
            publicKey={publicKey}
          />

          {/* Token Description */}
          {token.description && (
            <div className="mb-4">
              <Text variant="small" color="muted" className="line-clamp-2">
                {token.description}
              </Text>
            </div>
          )}

          <TokenStats token={token} />
          <TokenDetails token={token} />
          <BalanceWarning token={token} />
          <TokenActions
            token={token}
            activeHistoryTab={activeHistoryTab}
            publicKey={publicKey}
            onSelect={onSelect}
            onClose={onClose}
            closeLoading={closeLoading}
            isSelected={isSelected}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
