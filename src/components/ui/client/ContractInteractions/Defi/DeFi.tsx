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
 * Enhanced DeFi component with improved loading states and error handling
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
    loadingStates, // New: individual loading states
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
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);

  const handleInitUser = async () => {
    if (!isWalletConnected) {
      setStatus("Please connect your wallet first");
      setExplorerUrl(null);
      return;
    }

    const result = await initUser();
    if (result.success) {
      setStatus("User initialized successfully!");
      setExplorerUrl(result.explorerUrl || null);
    } else {
      setStatus(`Error: ${result.error}`);
      setExplorerUrl(null);
    }
  };

  const handleBuySOL = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      setStatus("Please enter a valid amount");
      setExplorerUrl(null);
      return;
    }

    const result = await buySOL({
      amountIn: parseFloat(swapAmount),
      slippage: 0.01, // 1% slippage
    });

    if (result.success) {
      setStatus("SOL purchase successful!");
      setExplorerUrl(result.explorerUrl || null);
      setSwapAmount("");
    } else {
      setStatus(`Error: ${result.error}`);
      setExplorerUrl(null);
    }
  };

  const handleSellSOL = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      setStatus("Please enter a valid amount");
      setExplorerUrl(null);
      return;
    }

    const result = await sellSOL({
      amountIn: parseFloat(swapAmount),
      slippage: 0.01, // 1% slippage
      bump: 1, // Default bump value
    });

    if (result.success) {
      setStatus("SOL sale successful!");
      setExplorerUrl(result.explorerUrl || null);
      setSwapAmount("");
    } else {
      setStatus(`Error: ${result.error}`);
      setExplorerUrl(null);
    }
  };

  const handleAddLiquidity = async () => {
    if (!liquidityAmount || parseFloat(liquidityAmount) <= 0) {
      setStatus("Please enter a valid amount");
      setExplorerUrl(null);
      return;
    }

    const result = await addLiquidity({
      amount: parseFloat(liquidityAmount),
      bump: 1, // Default bump value
    });

    if (result.success) {
      setStatus("Liquidity added successfully!");
      setExplorerUrl(result.explorerUrl || null);
      setLiquidityAmount("");
    } else {
      setStatus(`Error: ${result.error}`);
      setExplorerUrl(null);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!liquidityAmount || parseFloat(liquidityAmount) <= 0) {
      setStatus("Please enter a valid amount");
      setExplorerUrl(null);
      return;
    }

    const result = await removeLiquidity({
      amount: parseFloat(liquidityAmount),
      bump: 1, // Default bump value
    });

    if (result.success) {
      setStatus("Liquidity removed successfully!");
      setExplorerUrl(result.explorerUrl || null);
      setLiquidityAmount("");
    } else {
      setStatus(`Error: ${result.error}`);
      setExplorerUrl(null);
    }
  };

  const handleTransferAssets = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setStatus("Please enter a valid amount");
      setExplorerUrl(null);
      return;
    }

    if (!targetAddress) {
      setStatus("Please enter a target address");
      setExplorerUrl(null);
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
        setExplorerUrl(result.explorerUrl || null);
        setTransferAmount("");
        setTargetAddress("");
      } else {
        setStatus(`Error: ${result.error}`);
        setExplorerUrl(null);
      }
    } catch (error) {
      setStatus("Invalid target address");
      setExplorerUrl(null);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setStatus("Please enter a message");
      setExplorerUrl(null);
      return;
    }

    const result = await sendUserMessage({
      message,
      flashTarget: targetAddress ? new PublicKey(targetAddress) : undefined,
    });

    if (result.success) {
      setStatus("Message sent successfully!");
      setExplorerUrl(result.explorerUrl || null);
      setMessage("");
    } else {
      setStatus(`Error: ${result.error}`);
      setExplorerUrl(null);
    }
  };

  const clearStatus = () => {
    setStatus("");
    setExplorerUrl(null);
    clearError();
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

      {/* Error/Status Display */}
      {(error || status) && (
        <Card
          className={`mb-6 ${
            error || status.includes("Error")
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <CardContent className="py-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Text
                  color={
                    error || status.includes("Error") ? "error" : "success"
                  }
                >
                  {error || status}
                </Text>
                {explorerUrl && (
                  <div className="mt-2">
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      View Transaction on Explorer
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearStatus}
                className={`h-auto p-1 ${
                  error || status.includes("Error")
                    ? "text-red-500 hover:text-red-700"
                    : "text-green-500 hover:text-green-700"
                }`}
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
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <Text color="primary">Processing transaction...</Text>
            </div>
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
          <div className="space-y-2 mb-4">
            <Text color="secondary">
              Initialized: {accountState.isInitialized ? "Yes" : "No"}
            </Text>
            {accountState.userInfo && (
              <>
                <Text color="secondary">
                  Account Name: {accountState.userInfo.accountName || "Not set"}
                </Text>
                <Text color="secondary">
                  Asset Account: {accountState.userInfo.assetAccount}
                </Text>
                <Text color="secondary">
                  K Value: {accountState.userInfo.kValue.toFixed(4)}
                </Text>
              </>
            )}
          </div>
          {!accountState.isInitialized && (
            <Button
              onClick={handleInitUser}
              disabled={loadingStates.init}
              variant="default"
            >
              {loadingStates.init
                ? "Initializing..."
                : "Initialize User Account"}
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
              <Text color="secondary">
                K Constant: {poolInfo.kConstant.toFixed(4)}
              </Text>
            </div>
          ) : (
            <Text color="muted" className="mb-4">
              Loading pool information...
            </Text>
          )}
          <Button
            onClick={refreshPoolInfo}
            disabled={loadingStates.refresh}
            variant="secondary"
          >
            {loadingStates.refresh ? "Refreshing..." : "Refresh Pool Info"}
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
            disabled={loadingStates.refresh}
            variant="secondary"
          >
            {loadingStates.refresh ? "Refreshing..." : "Refresh Balance"}
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
                disabled={loadingStates.buy || !accountState.isInitialized}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {loadingStates.buy ? "Buying..." : "Buy SOL"}
              </Button>
              <Button
                onClick={handleSellSOL}
                disabled={loadingStates.sell || !accountState.isInitialized}
                variant="destructive"
                className="flex-1"
              >
                {loadingStates.sell ? "Selling..." : "Sell SOL"}
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
                disabled={
                  loadingStates.addLiquidity || !accountState.isInitialized
                }
                className="flex-1"
              >
                {loadingStates.addLiquidity ? "Adding..." : "Add Liquidity"}
              </Button>
              <Button
                onClick={handleRemoveLiquidity}
                disabled={
                  loadingStates.removeLiquidity || !accountState.isInitialized
                }
                variant="secondary"
                className="flex-1"
              >
                {loadingStates.removeLiquidity
                  ? "Removing..."
                  : "Remove Liquidity"}
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
              disabled={loadingStates.transfer || !accountState.isInitialized}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              {loadingStates.transfer ? "Transferring..." : "Transfer Assets"}
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
              disabled={loadingStates.message || !accountState.isInitialized}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              {loadingStates.message ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeFi;
