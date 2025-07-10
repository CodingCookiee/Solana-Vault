"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children, fallback }) => {
  const { isAuthenticated } = useAuth();
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="text-center text-gray-500 py-8">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-lg font-medium mb-2">Connect Your Wallet</p>
        <p className="text-sm">Please connect your wallet to access this feature</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="text-center text-gray-500 py-8">
        <svg className="w-12 h-12 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-medium mb-2">Authentication Required</p>
        <p className="text-sm">Please sign the message to verify your wallet ownership</p>
      </div>
    );
  }

  return <>{children}</>;
};
