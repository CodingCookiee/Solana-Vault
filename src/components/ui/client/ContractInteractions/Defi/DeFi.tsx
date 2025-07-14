"use client";

import React, { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useDexService } from "@/services/Defi";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Text,
} from "@/components/ui/common";

/**
 * Example component showing how to use the DeFi services
 */
export const DeFi: React.FC = () => {
  const {
    // Operations
    initUser,
    buySOL,
    sellSOL,
    addLiquidity,
    removeLiquidity,
    transferAssets,
    sendUserMessage,
    getQuote,

    // State
    poolInfo,
    userBalance,
    accountState,
    loading,
    error,
    isWalletConnected,

    // Utility
    clearError,
    refreshPoolInfo,
    refreshUserBalance,
  } = useDexService();

  // Local state for form inputs
  const [swapAmount, setSwapAmount] = useState("");
  const [liquidityAmount, setLiquidityAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleInitUser = async () => {
    if (!isWalletConnected) {
      setStatus("Please connect your wallet first");
      return;
    }

    const result = await initUser();
    if (result.success) {
      setStatus("User initialized successfully!");
    } else {
      console.error(`Error: ${result.error}`);
    }
  };

  const handleBuySOL = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      setStatus("Please enter a valid amount");
      return;
    }

    const result = await buySOL({
      amountIn: parseFloat(swapAmount),
      slippage: 0.01, // 1% slippage
    });

    if (result.success) {
      setStatus("SOL purchase successful!");
      setSwapAmount("");
    } else {
      console.error(`Error: ${result.error}`);
    }
  };

  const handleSellSOL = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      setStatus("Please enter a valid amount");
      return;
    }

    const result = await sellSOL({
      amountIn: parseFloat(swapAmount),
      slippage: 0.01, // 1% slippage
      bump: 1, // Default bump value
    });

    if (result.success) {
      setStatus("SOL sale successful!");
      setSwapAmount("");
    } else {
      console.error(`Error: ${result.error}`);
    }
  };

  const handleAddLiquidity = async () => {
    if (!liquidityAmount || parseFloat(liquidityAmount) <= 0) {
      setStatus("Please enter a valid amount");
      return;
    }

    const result = await addLiquidity({
      amount: parseFloat(liquidityAmount),
      bump: 1, // Default bump value
    });

    if (result.success) {
      setStatus("Liquidity added successfully!");
      setLiquidityAmount("");
    } else {
      console.error(`Error: ${result.error}`);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!liquidityAmount || parseFloat(liquidityAmount) <= 0) {
      setStatus("Please enter a valid amount");
      return;
    }

    const result = await removeLiquidity({
      amount: parseFloat(liquidityAmount),
      bump: 1, // Default bump value
    });

    if (result.success) {
      setStatus("Liquidity removed successfully!");
      setLiquidityAmount("");
    } else {
      console.error(`Error: ${result.error}`);
    }
  };

  const handleTransferAssets = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setStatus("Please enter a valid amount");
      return;
    }

    if (!targetAddress) {
      setStatus("Please enter a target address");
      return;
    }

    try {
      const flashTarget = new PublicKey(targetAddress);
      const result = await transferAssets({
        flashTarget,
        amount: parseFloat(transferAmount),
      });

      if (result.success) {
        setStatus("Assets transferred successfully!");
        setTransferAmount("");
        setTargetAddress("");
      } else {
        console.error(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Invalid target address");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setStatus("Please enter a message");
      return;
    }

    const result = await sendUserMessage({
      message,
      flashTarget: targetAddress ? new PublicKey(targetAddress) : undefined,
    });

    if (result.success) {
      setStatus("Message sent successfully!");
      setMessage("");
    } else {
      console.error(`Error: ${result.error}`);
    }
  };

  if (!isWalletConnected) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle>
              <Text variant="h4" color="warning">
                Wallet Not Connected
              </Text>
            </CardTitle>
            <CardDescription>
              <Text color="warning">
                Please connect your wallet to use the DeFi features.
              </Text>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Text variant="h1" className="mb-6">
        DeFi Interface
      </Text>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200 mb-6">
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <Text color="error">{error}</Text>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-500 hover:text-red-700 h-auto p-1"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {status && (
        <Card className="bg-red-50 border-red-200 mb-6">
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <Text color="error">{status}</Text>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-500 hover:text-red-700 h-auto p-1"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Card className="bg-blue-50 border-blue-200 mb-6">
          <CardContent className="py-4">
            <Text color="primary">Processing transaction...</Text>
          </CardContent>
        </Card>
      )}

      {/* Account Status */}
      <Card className="bg-gray-50 border-gray-200 mb-6">
        <CardHeader>
          <CardTitle>
            <Text variant="h4">Account Status</Text>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text color="secondary" className="mb-4">
            Initialized: {accountState.isInitialized ? "Yes" : "No"}
          </Text>
          {!accountState.isInitialized && (
            <Button
              onClick={handleInitUser}
              disabled={loading}
              variant="default"
            >
              Initialize User Account
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Pool Information */}
      <Card className="bg-gray-50 border-gray-200 mb-6">
        <CardHeader>
          <CardTitle>
            <Text variant="h4">Pool Information</Text>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {poolInfo ? (
            <div className="space-y-2 mb-4">
              <Text color="secondary">
                SOL Balance: {poolInfo.solBalance.toFixed(4)} SOL
              </Text>
              <Text color="secondary">
                SFC Balance: {poolInfo.sfcBalance.toFixed(4)} SFC
              </Text>
              <Text color="secondary">
                LP Token Supply: {poolInfo.lpTokenSupply.toFixed(4)}
              </Text>
            </div>
          ) : (
            <Text color="muted" className="mb-4">
              Loading pool information...
            </Text>
          )}
          <Button
            onClick={refreshPoolInfo}
            disabled={loading}
            variant="secondary"
          >
            Refresh Pool Info
          </Button>
        </CardContent>
      </Card>

      {/* User Balance */}
      <Card className="bg-gray-50 border-gray-200 mb-6">
        <CardHeader>
          <CardTitle>
            <Text variant="h4">Your Balance</Text>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userBalance ? (
            <div className="space-y-2 mb-4">
              <Text color="secondary">
                SOL: {userBalance.sol.toFixed(4)} SOL
              </Text>
              <Text color="secondary">
                SFC: {userBalance.sfc.toFixed(4)} SFC
              </Text>
              <Text color="secondary">
                LP Tokens: {userBalance.lpTokens.toFixed(4)}
              </Text>
            </div>
          ) : (
            <Text color="muted" className="mb-4">
              Loading balance...
            </Text>
          )}
          <Button
            onClick={refreshUserBalance}
            disabled={loading}
            variant="secondary"
          >
            Refresh Balance
          </Button>
        </CardContent>
      </Card>

      {/* Trading Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            <Text variant="h4">Trading</Text>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Text
                variant="small"
                weight="medium"
                color="secondary"
                className="block mb-2"
              >
                Amount (SOL)
              </Text>
              <input
                type="number"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleBuySOL}
                disabled={loading || !accountState.isInitialized}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                Buy SOL
              </Button>
              <Button
                onClick={handleSellSOL}
                disabled={loading || !accountState.isInitialized}
                variant="destructive"
                className="flex-1"
              >
                Sell SOL
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liquidity Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            <Text variant="h4">Liquidity</Text>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Text
                variant="small"
                weight="medium"
                color="secondary"
                className="block mb-2"
              >
                Amount (SOL)
              </Text>
              <input
                type="number"
                value={liquidityAmount}
                onChange={(e) => setLiquidityAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddLiquidity}
                disabled={loading || !accountState.isInitialized}
                className="flex-1"
              >
                Add Liquidity
              </Button>
              <Button
                onClick={handleRemoveLiquidity}
                disabled={loading || !accountState.isInitialized}
                variant="secondary"
                className="flex-1"
              >
                Remove Liquidity
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            <Text variant="h4">Transfer Assets</Text>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Text
                variant="small"
                weight="medium"
                color="secondary"
                className="block mb-2"
              >
                Target Address
              </Text>
              <input
                type="text"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                placeholder="Enter target public key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Text
                variant="small"
                weight="medium"
                color="secondary"
                className="block mb-2"
              >
                Amount (SOL)
              </Text>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={handleTransferAssets}
              disabled={loading || !accountState.isInitialized}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              Transfer Assets
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Text variant="h4">Send Message</Text>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Text
                variant="small"
                weight="medium"
                color="secondary"
                className="block mb-2"
              >
                Target Address (optional)
              </Text>
              <input
                type="text"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                placeholder="Enter target public key (leave empty for general message)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Text
                variant="small"
                weight="medium"
                color="secondary"
                className="block mb-2"
              >
                Message
              </Text>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={loading || !accountState.isInitialized}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeFi;
