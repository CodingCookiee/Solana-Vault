"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

// Initialize ed25519 for browser use
ed25519.utils.sha512Sync = (...m) => sha512(ed25519.utils.concatBytes(...m));

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authMessage: string;
  signature: string | null;
  authenticate: () => Promise<void>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Generate a unique message for this session
  const [authMessage] = useState(() => {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    return `Welcome to Solana Wallet App!\n\nPlease sign this message to verify your wallet ownership and access the application.\n\nTimestamp: ${timestamp}\nNonce: ${nonce}`;
  });

  // Reset authentication when wallet disconnects
  useEffect(() => {
    if (!connected || !publicKey) {
      setIsAuthenticated(false);
      setSignature(null);
      setShowAuthModal(false);
    }
  }, [connected, publicKey]);

  // Show auth modal when wallet connects but not authenticated
  useEffect(() => {
    if (connected && publicKey && !isAuthenticated && !isAuthenticating) {
      setShowAuthModal(true);
    }
  }, [connected, publicKey, isAuthenticated, isAuthenticating]);

  const authenticate = async () => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsAuthenticating(true);
      
      // Convert message to bytes
      const messageBytes = new TextEncoder().encode(authMessage);
      
      // Sign the message
      const signatureBytes = await signMessage(messageBytes);
      
      // Verify the signature
      const isValid = await ed25519.verify(
        signatureBytes,
        messageBytes,
        publicKey.toBytes()
      );
      
      if (!isValid) {
        throw new Error('Invalid signature');
      }
      
      // Store signature and mark as authenticated
      const signatureBase64 = Buffer.from(signatureBytes).toString('base64');
      setSignature(signatureBase64);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSignature(null);
    setShowAuthModal(false);
    disconnect();
  };

  return (
    <AuthContext.Provider 
      value={{
        isAuthenticated,
        isAuthenticating,
        authMessage,
        signature,
        authenticate,
        logout,
        showAuthModal,
        setShowAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
