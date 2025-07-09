"use client";

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/contexts/AuthContext';
import { Text } from '@/components/ui/common';
import { Card, CardContent } from '@/components/ui/common';

export const AuthFlowInfo: React.FC = () => {
  const { connected } = useWallet();
  const { isAuthenticated } = useAuth();

  return (
    <Card className="max-w-2xl mx-auto mb-6">
      <CardContent className="py-6">
        <div className="text-center space-y-4">
          <Text variant="h4" color="primary" weight="semibold">
            How It Works
          </Text>
          
          <div className="flex justify-center space-x-8">
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                connected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <div className={`w-6 h-6 rounded-full ${
                  connected ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              <Text variant="small" color={connected ? "success" : "muted"} weight="medium">
                1. Connect Wallet
              </Text>
            </div>
            
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                connected && !isAuthenticated ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
                isAuthenticated ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <div className={`w-6 h-6 rounded-full ${
                  connected && !isAuthenticated ? 'bg-yellow-500' :
                  isAuthenticated ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              <Text variant="small" color={
                connected && !isAuthenticated ? "warning" :
                isAuthenticated ? "success" : "muted"
              } weight="medium">
                2. Sign Message
              </Text>
            </div>
            
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isAuthenticated ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <div className={`w-6 h-6 rounded-full ${
                  isAuthenticated ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              <Text variant="small" color={isAuthenticated ? "success" : "muted"} weight="medium">
                3. Use Features
              </Text>
            </div>
          </div>
          
          <div className="mt-6">
            {!connected && (
              <Text variant="small" color="muted" align="center">
                Connect your Phantom wallet to get started
              </Text>
            )}
            {connected && !isAuthenticated && (
              <Text variant="small" color="warning" align="center">
                Please sign the authentication message to continue
              </Text>
            )}
            {isAuthenticated && (
              <Text variant="small" color="success" align="center">
                ✅ You're authenticated! You can now use all features
              </Text>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
