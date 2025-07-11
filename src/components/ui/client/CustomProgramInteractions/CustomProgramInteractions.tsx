"use client";

import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Button,
  Text,
} from "@/components/ui/common";
import {
  useRealProgramInteractions,
  RealProgramResult,
  REAL_PROGRAMS,
} from "@/services/real-program-interactions";

export const CustomProgramInteractions: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();


  const {
    sendMemoMessage,
    createDataAccount,
    checkAccountExists,
    getAccountTransactions,
    transferSol,
  } = useRealProgramInteractions();

  // State management
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  // Counter state
  const [counterAddress, setCounterAddress] = useState<string>("");
  const [counterData, setCounterData] = useState<CounterAccount | null>(null);

  // Hello World state
  const [helloMessage, setHelloMessage] = useState<string>("Hello, Solana!");
  const [messageAddress, setMessageAddress] = useState<string>("");

  // Memo state
  const [memoText, setMemoText] = useState<string>(
    "This is a memo from my dApp!"
  );

  // Account reader state
  const [accountToRead, setAccountToRead] = useState<string>("");
  const [accountData, setAccountData] = useState<any>(null);

  // SOL transfer state
  const [solRecipient, setSolRecipient] = useState<string>("");
  const [solAmount, setSolAmount] = useState<string>("0.01");

  // Helper functions
  const handleResult = (
    result: ProgramInteractionResult,
    successMessage: string
  ) => {
    if (result.success) {
      setStatus(`✅ ${successMessage}: ${result.signature}`);
      // Handle specific data
      if (result.data?.counterAddress) {
        setCounterAddress(result.data.counterAddress);
      }
      if (result.data?.messageAddress) {
        setMessageAddress(result.data.messageAddress);
      }
    } else {
      setStatus(`❌ Error: ${result.error}`);
    }
  };

  const executeWithLoading = async (
    operation: () => Promise<void>,
    loadingMessage: string
  ) => {
    if (!wallet.connected || !wallet.publicKey) {
      setStatus("❌ Wallet not connected. Please connect your wallet.");
      return;
    }

    try {
      setLoading(true);
      setStatus(`⏳ ${loadingMessage}...`);
      await operation();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      console.error("Operation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load counter data when address changes
  useEffect(() => {
    if (counterAddress && wallet.publicKey) {
      loadCounterData();
    }
  }, [counterAddress, wallet.publicKey]);

  const loadCounterData = async () => {
    if (!counterAddress || !wallet.publicKey) return;

    try {
      const counterPubkey = new PublicKey(counterAddress);
      const data = await getCounterData(
        connection,
        wallet as any,
        EXAMPLE_PROGRAMS.COUNTER,
        counterPubkey
      );
      setCounterData(data);
    } catch (error) {
      console.error("Error loading counter data:", error);
    }
  };

  // Program interactions
  const handleInitializeCounter = async () => {
    await executeWithLoading(async () => {
      const result = await initializeCounter(
        connection,
        wallet as any,
        EXAMPLE_PROGRAMS.COUNTER
      );
      handleResult(result, "Counter initialized");
    }, "Initializing counter");
  };

  const handleIncrementCounter = async () => {
    if (!counterAddress) {
      setStatus("❌ Please initialize a counter first");
      return;
    }

    await executeWithLoading(async () => {
      const counterPubkey = new PublicKey(counterAddress);
      const result = await incrementCounter(
        connection,
        wallet as any,
        EXAMPLE_PROGRAMS.COUNTER,
        counterPubkey
      );
      handleResult(result, "Counter incremented");

      // Refresh counter data
      setTimeout(loadCounterData, 2000);
    }, "Incrementing counter");
  };

  const handleSendMemo = async () => {
    if (!memoText.trim()) {
      setStatus("❌ Please enter a memo message");
      return;
    }

    await executeWithLoading(async () => {
      const result = await sendMemoMessage(connection, wallet as any, memoText);
      if (result.success) {
        setStatus(`✅ Memo sent successfully!`);
        if (result.data?.explorerUrl) {
          setStatus(
            `✅ Memo sent! View on Explorer: ${result.data.explorerUrl}`
          );
        }
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    }, "Sending memo");
  };

  const handleCreateHelloMessage = async () => {
    if (!helloMessage.trim()) {
      setStatus("❌ Please enter a message");
      return;
    }

    await executeWithLoading(async () => {
      const result = await createHelloWorldMessage(
        connection,
        wallet as any,
        EXAMPLE_PROGRAMS.HELLO_WORLD,
        helloMessage
      );
      handleResult(result, "Hello World message created");
    }, "Creating message");
  };

  const handleReadAccount = async () => {
    if (!accountToRead.trim()) {
      setStatus("❌ Please enter an account address");
      return;
    }

    await executeWithLoading(async () => {
      try {
        const accountPubkey = new PublicKey(accountToRead);
        const data = await readAccountData(connection, accountPubkey);
        setAccountData(data);
        setStatus("✅ Account data loaded successfully");
      } catch (error) {
        throw new Error(`Invalid account address: ${error}`);
      }
    }, "Reading account data");
  };

  const handleTransferSol = async () => {
    if (!solRecipient.trim() || !solAmount.trim()) {
      setStatus("❌ Please enter recipient address and amount");
      return;
    }

    await executeWithLoading(async () => {
      try {
        const recipientPubkey = new PublicKey(solRecipient);
        const amount = parseFloat(solAmount);
        if (isNaN(amount) || amount <= 0) {
          throw new Error("Amount must be a positive number");
        }

        const result = await transferSol(
          connection,
          wallet as any,
          recipientPubkey,
          amount
        );
        if (result.success) {
          setStatus(`✅ Transferred ${amount} SOL successfully!`);
          if (result.data?.explorerUrl) {
            setStatus(
              `✅ Transfer successful! View on Explorer: ${result.data.explorerUrl}`
            );
          }
        } else {
          setStatus(`❌ Error: ${result.error}`);
        }
      } catch (error) {
        throw new Error(`Transfer failed: ${error}`);
      }
    }, "Transferring SOL");
  };

  const isValidSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  // Show loading state if wallet is not ready
  if (!wallet.connected) {
    return (
      <AuthGate>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <Text variant="h5" color="muted">
              Please connect your wallet to interact with Solana programs
            </Text>
          </CardContent>
        </Card>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h3" color="primary">
                Custom Solana Program Interactions
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="body" color="muted">
                Interact with deployed Solana programs, send memos, and explore
                on-chain data
              </Text>
            </CardDescription>
          </CardHeader>
        </Card>

        
        {/* Memo Program - Real Program Interaction */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                📝 Memo Program (Live on Devnet)
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="small" color="muted">
                Send a memo to the Solana blockchain using the official Memo
                program
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2">
                <Text variant="small" weight="medium">
                  Memo Message
                </Text>
              </label>
              <textarea
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
                placeholder="Enter your memo message..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 resize-none"
                rows={3}
              />
            </div>
            <Button
              onClick={handleSendMemo}
              disabled={loading || !memoText.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Send Memo to Blockchain
            </Button>
          </CardContent>
        </Card>

        {/* SOL Transfer - Real Transaction */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                💰 SOL Transfer (Live on Devnet)
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="small" color="muted">
                Transfer SOL between accounts using the System Program
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Recipient Address
                  </Text>
                </label>
                <input
                  type="text"
                  value={solRecipient}
                  onChange={(e) => setSolRecipient(e.target.value)}
                  placeholder="Enter recipient address..."
                  className={`w-full p-3 border rounded-lg dark:bg-gray-800 ${
                    solRecipient && !isValidSolanaAddress(solRecipient)
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : solRecipient && isValidSolanaAddress(solRecipient)
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
              </div>
              <div>
                <label className="block mb-2">
                  <Text variant="small" weight="medium">
                    Amount (SOL)
                  </Text>
                </label>
                <input
                  type="number"
                  value={solAmount}
                  onChange={(e) => setSolAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                />
              </div>
            </div>
            <Button
              onClick={handleTransferSol}
              disabled={
                loading ||
                !solRecipient ||
                !solAmount ||
                !isValidSolanaAddress(solRecipient)
              }
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Transfer SOL
            </Button>
          </CardContent>
        </Card>


        {/* Account Reader */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                🔍 Account Data Reader
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="small" color="muted">
                Read raw account data from any Solana account
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2">
                <Text variant="small" weight="medium">
                  Account Address
                </Text>
              </label>
              <input
                type="text"
                value={accountToRead}
                onChange={(e) => setAccountToRead(e.target.value)}
                placeholder="Enter Solana account address..."
                className={`w-full p-3 border rounded-lg dark:bg-gray-800 ${
                  accountToRead && !isValidSolanaAddress(accountToRead)
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : accountToRead && isValidSolanaAddress(accountToRead)
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {accountToRead && !isValidSolanaAddress(accountToRead) && (
                <Text variant="extraSmall" color="error" className="mt-1">
                  Invalid Solana address format
                </Text>
              )}
            </div>
            <Button
              onClick={handleReadAccount}
              disabled={
                loading ||
                !accountToRead ||
                !isValidSolanaAddress(accountToRead)
              }
              variant="outline"
              className="w-full"
            >
              Read Account Data
            </Button>

            {accountData && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <Text variant="small" weight="semibold" color="primary">
                  Account Information:
                </Text>
                <div className="mt-2 space-y-1">
                  <Text variant="small" color="default">
                    Owner: {accountData.owner}
                  </Text>
                  <Text variant="small" color="default">
                    Balance: {accountData.lamports / 1e9} SOL
                  </Text>
                  <Text variant="small" color="default">
                    Data Length: {accountData.dataLength} bytes
                  </Text>
                  <Text variant="small" color="default">
                    Executable: {accountData.executable ? "Yes" : "No"}
                  </Text>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Program IDs Reference */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                📋 Program IDs Reference
              </Text>
            </CardTitle>
            <CardDescription>
              <Text variant="small" color="muted">
                Common Solana program addresses
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text variant="small" weight="medium">
                    System Program:
                  </Text>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 font-mono text-xs break-all">
                    {REAL_PROGRAMS.SYSTEM.toBase58()}
                  </div>
                </div>
                <div>
                  <Text variant="small" weight="medium">
                    Memo Program (Working):
                  </Text>
                  <div className="bg-green-100 dark:bg-green-800 p-2 rounded mt-1 font-mono text-xs break-all">
                    {REAL_PROGRAMS.MEMO.toBase58()}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <Text variant="extraSmall" color="muted">
                  💡 Tip: The Memo Program is fully functional - try sending a
                  message! You can also use these addresses to read account
                  data.
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Display */}
        {status && (
          <Card>
            <CardContent>
              <div
                className={`p-4 rounded-lg border ${
                  status.includes("❌")
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : status.includes("✅")
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <Text variant="small" weight="medium" className="break-all">
                      {status}
                    </Text>
                  </div>
                  {status.includes("✅") && (
                    <Button
                      onClick={() => setStatus("")}
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGate>
  );
};
