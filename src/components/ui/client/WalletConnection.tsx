"use client";

import { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const WalletConnection: FC = () => {
  const { publicKey, connected, connecting, disconnect } = useWallet();

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h2 className="text-2xl font-bold">Wallet Connection</h2>
      
      {/* Wallet Connect Button */}
      <WalletMultiButton />
      
      {/* Connection Status */}
      <div className="text-center">
        {connecting && (
          <p className="text-yellow-600">Connecting to wallet...</p>
        )}
        
        {connected && publicKey && (
          <div className="space-y-2">
            <p className="text-green-600">✅ Wallet Connected</p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Public Key:</span>
              <br />
              <span className="font-mono text-xs break-all">
                {publicKey.toBase58()}
              </span>
            </p>
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
        
        {!connected && !connecting && (
          <p className="text-red-600">❌ Wallet not connected</p>
        )}
      </div>
    </div>
  );
};
