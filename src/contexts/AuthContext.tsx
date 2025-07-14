"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ed25519 } from "@noble/curves/ed25519";
import bs58 from "bs58";

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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Auth token structure
interface AuthToken {
  publicKey: string;
  signature: string;
  message: string;
  timestamp: number;
  expiresAt: number;
}

// Token validity duration (24 hours)
const TOKEN_VALIDITY_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { publicKey, signMessage, connected, disconnect, connecting } =
    useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasShownModalForCurrentWallet, setHasShownModalForCurrentWallet] =
    useState(false);

  // Generate a unique message for this session
  const [authMessage] = useState(() => {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    return `Welcome to Solana Wallet App!\n\nPlease sign this message to verify your wallet ownership and access the application.\n\nTimestamp: ${timestamp}\nNonce: ${nonce}`;
  });

  // Utility functions for localStorage
  const getStoredToken = (walletAddress: string): AuthToken | null => {
    try {
      const stored = localStorage.getItem(`auth_token_${walletAddress}`);
      if (!stored) return null;
      
      const token: AuthToken = JSON.parse(stored);
      
      // Check if token is expired
      if (Date.now() > token.expiresAt) {
        localStorage.removeItem(`auth_token_${walletAddress}`);
        return null;
      }
      
      return token;
    } catch (error) {
      console.error("Error reading stored token:", error);
      return null;
    }
  };

  const storeToken = (token: AuthToken) => {
    try {
      localStorage.setItem(`auth_token_${token.publicKey}`, JSON.stringify(token));
    } catch (error) {
      console.error("Error storing token:", error);
    }
  };

  const clearStoredToken = (walletAddress: string) => {
    try {
      localStorage.removeItem(`auth_token_${walletAddress}`);
    } catch (error) {
      console.error("Error clearing stored token:", error);
    }
  };

  // Verify signature is valid
  const verifySignature = (message: string, signature: string, publicKeyString: string): boolean => {
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = Buffer.from(signature, 'base64');
      const publicKeyBytes = bs58.decode(publicKeyString);
      
      return ed25519.verify(signatureBytes, messageBytes, publicKeyBytes);
    } catch (error) {
      console.error("Error verifying signature:", error);
      return false;
    }
  };

  // Check for stored valid token on wallet connection
  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toBase58();
      const storedToken = getStoredToken(walletAddress);
      
      if (storedToken && verifySignature(storedToken.message, storedToken.signature, storedToken.publicKey)) {
        setIsAuthenticated(true);
        setSignature(storedToken.signature);
        setShowAuthModal(false);
        setHasShownModalForCurrentWallet(true); // Skip modal since we have valid token
      }
    }
  }, [connected, publicKey]);

  // Reset authentication when wallet disconnects or changes
  useEffect(() => {
    if (!connected || !publicKey) {
      setIsAuthenticated(false);
      setSignature(null);
      setShowAuthModal(false);
      setHasShownModalForCurrentWallet(false);
    }
  }, [connected, publicKey]);

  // Reset modal flag when wallet changes
  useEffect(() => {
    setHasShownModalForCurrentWallet(false);
  }, [publicKey?.toBase58()]);

  // Show auth modal when wallet is fully connected but not authenticated
  useEffect(() => {
    // Only show modal if:
    // 1. Wallet is connected and not connecting
    // 2. We have a public key
    // 3. User is not authenticated
    // 4. We're not currently authenticating
    // 5. We haven't shown the modal for this wallet yet
    if (
      connected &&
      !connecting &&
      publicKey &&
      !isAuthenticated &&
      !isAuthenticating &&
      !hasShownModalForCurrentWallet
    ) {
      // Add a small delay to ensure wallet connection is fully established
      const timer = setTimeout(() => {
        setShowAuthModal(true);
        setHasShownModalForCurrentWallet(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    connected,
    connecting,
    publicKey,
    isAuthenticated,
    isAuthenticating,
    hasShownModalForCurrentWallet,
  ]);

  const authenticate = async () => {
    if (!publicKey || !signMessage) {
      throw new Error("Wallet not connected");
    }

    try {
      setIsAuthenticating(true);

      // Convert message to bytes
      const messageBytes = new TextEncoder().encode(authMessage);

      // Sign the message - if this succeeds, we trust the wallet's signature
      const signatureBytes = await signMessage(messageBytes);

      // Store signature and mark as authenticated
      const signatureBase64 = Buffer.from(signatureBytes).toString("base64");
      setSignature(signatureBase64);
      setIsAuthenticated(true);
      setShowAuthModal(false);

      // Create and store auth token
      const now = Date.now();
      const authToken: AuthToken = {
        publicKey: publicKey.toBase58(),
        signature: signatureBase64,
        message: authMessage,
        timestamp: now,
        expiresAt: now + TOKEN_VALIDITY_DURATION
      };

      storeToken(authToken);
    } catch (error) {
      console.error("Authentication failed:", error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    // Clear stored token if publicKey exists
    if (publicKey) {
      clearStoredToken(publicKey.toBase58());
      localStorage.clear();
    }
    
    setIsAuthenticated(false);
    setSignature(null);
    setShowAuthModal(false);
    setHasShownModalForCurrentWallet(false);
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
