import React, { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useDexService } from "@/services/Defi";

/**
 * Example component showing how to use the DeFi services
 */
export const Defi: React.FC = () => {
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

  const handleInitUser = async () => {
    if (!isWalletConnected) {
      alert("Please connect your wallet first");
      return;
    }

    const result = await initUser();
    if (result.success) {
      alert("User initialized successfully!");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleBuySOL = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const result = await buySOL({
      amountIn: parseFloat(swapAmount),
      slippage: 0.01, // 1% slippage
    });

    if (result.success) {
      alert("SOL purchase successful!");
      setSwapAmount("");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleSellSOL = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const result = await sellSOL({
      amountIn: parseFloat(swapAmount),
      slippage: 0.01, // 1% slippage
      bump: 1, // Default bump value
    });

    if (result.success) {
      alert("SOL sale successful!");
      setSwapAmount("");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleAddLiquidity = async () => {
    if (!liquidityAmount || parseFloat(liquidityAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const result = await addLiquidity({
      amount: parseFloat(liquidityAmount),
      bump: 1, // Default bump value
    });

    if (result.success) {
      alert("Liquidity added successfully!");
      setLiquidityAmount("");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!liquidityAmount || parseFloat(liquidityAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const result = await removeLiquidity({
      amount: parseFloat(liquidityAmount),
      bump: 1, // Default bump value
    });

    if (result.success) {
      alert("Liquidity removed successfully!");
      setLiquidityAmount("");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleTransferAssets = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!targetAddress) {
      alert("Please enter a target address");
      return;
    }

    try {
      const flashTarget = new PublicKey(targetAddress);
      const result = await transferAssets({
        flashTarget,
        amount: parseFloat(transferAmount),
      });

      if (result.success) {
        alert("Assets transferred successfully!");
        setTransferAmount("");
        setTargetAddress("");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("Invalid target address");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    const result = await sendUserMessage({
      message,
      flashTarget: targetAddress ? new PublicKey(targetAddress) : undefined,
    });

    if (result.success) {
      alert("Message sent successfully!");
      setMessage("");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  if (!isWalletConnected) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Wallet Not Connected
          </h2>
          <p className="text-yellow-700">
            Please connect your wallet to use the DeFi features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">DeFi Interface</h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-700">Processing transaction...</p>
        </div>
      )}

      {/* Account Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Account Status</h2>
        <p className="text-gray-700">
          Initialized: {accountState.isInitialized ? "Yes" : "No"}
        </p>
        {!accountState.isInitialized && (
          <button
            onClick={handleInitUser}
            disabled={loading}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Initialize User Account
          </button>
        )}
      </div>

      {/* Pool Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Pool Information</h2>
        {poolInfo ? (
          <div className="space-y-2">
            <p>SOL Balance: {poolInfo.solBalance.toFixed(4)} SOL</p>
            <p>SFC Balance: {poolInfo.sfcBalance.toFixed(4)} SFC</p>
            <p>LP Token Supply: {poolInfo.lpTokenSupply.toFixed(4)}</p>
          </div>
        ) : (
          <p className="text-gray-500">Loading pool information...</p>
        )}
        <button
          onClick={refreshPoolInfo}
          disabled={loading}
          className="mt-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          Refresh Pool Info
        </button>
      </div>

      {/* User Balance */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Balance</h2>
        {userBalance ? (
          <div className="space-y-2">
            <p>SOL: {userBalance.sol.toFixed(4)} SOL</p>
            <p>SFC: {userBalance.sfc.toFixed(4)} SFC</p>
            <p>LP Tokens: {userBalance.lpTokens.toFixed(4)}</p>
          </div>
        ) : (
          <p className="text-gray-500">Loading balance...</p>
        )}
        <button
          onClick={refreshUserBalance}
          disabled={loading}
          className="mt-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          Refresh Balance
        </button>
      </div>

      {/* Trading Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Trading</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (SOL)
            </label>
            <input
              type="number"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBuySOL}
              disabled={loading || !accountState.isInitialized}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Buy SOL
            </button>
            <button
              onClick={handleSellSOL}
              disabled={loading || !accountState.isInitialized}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Sell SOL
            </button>
          </div>
        </div>
      </div>

      {/* Liquidity Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Liquidity</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (SOL)
            </label>
            <input
              type="number"
              value={liquidityAmount}
              onChange={(e) => setLiquidityAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddLiquidity}
              disabled={loading || !accountState.isInitialized}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Add Liquidity
            </button>
            <button
              onClick={handleRemoveLiquidity}
              disabled={loading || !accountState.isInitialized}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Remove Liquidity
            </button>
          </div>
        </div>
      </div>

      {/* Transfer Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Transfer Assets</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Address
            </label>
            <input
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="Enter target public key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (SOL)
            </label>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleTransferAssets}
            disabled={loading || !accountState.isInitialized}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Transfer Assets
          </button>
        </div>
      </div>

      {/* Message Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Send Message</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Address (optional)
            </label>
            <input
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="Enter target public key (leave empty for general message)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={loading || !accountState.isInitialized}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default Defi;
