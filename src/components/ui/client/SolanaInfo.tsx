"use client";

import { FC } from "react";

export const SolanaInfo: FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Solana Basics</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">What is Solana?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• High-performance blockchain (~65,000 TPS)</li>
            <li>• Low fees (~$0.00025 per transaction)</li>
            <li>• Fast finality (~400ms)</li>
            <li>• Uses Proof of History + Proof of Stake</li>
          </ul>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Key Concepts</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• <strong>Accounts:</strong> Store all data (programs, wallets, state)</li>
            <li>• <strong>Lamports:</strong> Smallest unit of SOL (1 SOL = 1B lamports)</li>
            <li>• <strong>Programs:</strong> Smart contracts (stateless)</li>
            <li>• <strong>Transactions:</strong> Multiple instructions executed atomically</li>
          </ul>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">Phantom Wallet</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Most popular Solana wallet</li>
            <li>• Browser extension + mobile app</li>
            <li>• Supports SOL and SPL tokens</li>
            <li>• Built-in dApp browser</li>
          </ul>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-semibold text-orange-800 mb-2">Networks</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• <strong>Mainnet:</strong> Production network</li>
            <li>• <strong>Devnet:</strong> Development/testing (free SOL)</li>
            <li>• <strong>Testnet:</strong> Pre-production testing</li>
            <li>• <strong>Localnet:</strong> Local development</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Getting Started</h4>
        <ol className="text-sm text-gray-700 space-y-1">
          <li>1. Install Phantom wallet browser extension</li>
          <li>2. Create a new wallet or import existing</li>
          <li>3. Switch to Devnet for testing</li>
          <li>4. Get free SOL from a devnet faucet</li>
          <li>5. Connect your wallet to this app</li>
        </ol>
      </div>
    </div>
  );
};
