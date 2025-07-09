"use client";

import { FC, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as ed25519 from "@noble/ed25519";
import { sha512 } from '@noble/hashes/sha512';

// Initialize ed25519 for browser use
ed25519.utils.sha512Sync = (...m) => sha512(ed25519.utils.concatBytes(...m));

export const MessageSigning: FC = () => {
  const { publicKey, signMessage } = useWallet();
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  // Sign a message
  const handleSignMessage = useCallback(async () => {
    if (!publicKey || !signMessage || !message.trim()) return;

    try {
      setIsLoading(true);
      setStatus("Signing message...");

      // Convert message to Uint8Array
      const messageBytes = new TextEncoder().encode(message);

      // Sign the message
      const signatureBytes = await signMessage(messageBytes);

      // Convert signature to base58 string for display
      const signatureBase58 = Buffer.from(signatureBytes).toString("base64");
      setSignature(signatureBase58);

      setStatus("Message signed successfully!");

      // Auto-verify the signature
      await verifyMessageSignature(messageBytes, signatureBytes, publicKey);
    } catch (error) {
      console.error("Error signing message:", error);
      setStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signMessage, message]);

  // Verify a signature
  const verifyMessageSignature = useCallback(
    async (
      messageBytes: Uint8Array,
      signatureBytes: Uint8Array,
      signerPublicKey: PublicKey
    ) => {
      try {
        setStatus("Verifying signature...");

        // Verify using ed25519
        const isValid = await ed25519.verify(
          signatureBytes,
          messageBytes,
          signerPublicKey.toBytes()
        );

        setVerificationResult(isValid);
        setStatus(
          isValid
            ? "✅ Signature verified!"
            : "❌ Signature verification failed!"
        );
      } catch (error) {
        console.error("Error verifying signature:", error);
        setVerificationResult(false);
        setStatus("❌ Verification error");
      }
    },
    []
  );

  // Manual verification with custom inputs
  const handleManualVerification = useCallback(async () => {
    if (!message.trim() || !signature.trim() || !publicKey) return;

    try {
      setIsLoading(true);

      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = Buffer.from(signature, "base64");

      await verifyMessageSignature(messageBytes, signatureBytes, publicKey);
    } catch (error) {
      console.error("Error in manual verification:", error);
      setStatus(
        `Verification error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setVerificationResult(false);
    } finally {
      setIsLoading(false);
    }
  }, [message, signature, publicKey, verifyMessageSignature]);

  return (
    <AuthGate>
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Message Signing & Verification</h3>

      {/* Message Input */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Sign a Message</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Message to Sign:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              rows={3}
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>
          <button
            onClick={handleSignMessage}
            disabled={isLoading || !message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing..." : "Sign Message"}
          </button>
        </div>
      </div>

      {/* Signature Display */}
      {signature && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Generated Signature</h4>
          <div className="bg-white p-2 rounded border">
            <p className="text-xs font-mono break-all">{signature}</p>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(signature)}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              Copy
            </button>
            <button
              onClick={handleManualVerification}
              disabled={isLoading}
              className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {/* Verification Result */}
      {verificationResult !== null && (
        <div
          className={`p-4 rounded-lg ${
            verificationResult ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <h4 className="font-semibold mb-2">Verification Result</h4>
          <p
            className={`text-sm ${
              verificationResult ? "text-green-700" : "text-red-700"
            }`}
          >
            {verificationResult
              ? "✅ Signature is valid!"
              : "❌ Signature is invalid!"}
          </p>
        </div>
      )}

      {/* Status Display */}
      {status && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">{status}</p>
        </div>
      )}

      {/* Educational Info */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">How Message Signing Works</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Your wallet signs the message with your private key</li>
          <li>
            • Creates a unique signature that proves you authored the message
          </li>
          <li>• Anyone can verify the signature using your public key</li>
          <li>
            • Useful for authentication, proving ownership, and non-repudiation
          </li>
        </ul>
      </div>
    </div>
    </AuthGate>
  );
};
