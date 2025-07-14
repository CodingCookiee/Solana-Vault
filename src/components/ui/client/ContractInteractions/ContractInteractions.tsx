"use client";

import React, { useState } from "react";
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

// Import the new structured services
import { useMemoService } from "@/services/memo";
import { useSystemService } from "@/services/system";
import { useAccountService } from "@/services/account";
import { SOLANA_PROGRAMS } from "@/services/constants";
import { DeFi } from "./Defi/DeFi";

export const ContractInteractions: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Use the new service hooks
  const memoService = useMemoService();
  const systemService = useSystemService();
  const accountService = useAccountService();

  // State management
  const [status, setStatus] = useState<string>("");

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

  // Helper function to check if any service is loading
  const isLoading =
    memoService.loading || systemService.loading || accountService.loading;

  // Helper functions
  const executeWithLoading = async (
    operation: () => Promise<void>,
    loadingMessage: string
  ) => {
    if (!wallet.connected || !wallet.publicKey) {
      setStatus("❌ Wallet not connected. Please connect your wallet.");
      return;
    }

    try {
      setStatus(`⏳ ${loadingMessage}...`);
      await operation();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
      console.error("Operation failed:", error);
    }
  };

  const handleSendMemo = async () => {
    // Validate memo message using the service
    const validation = memoService.validateMessage(memoText);
    if (!validation.valid) {
      setStatus(`❌ ${validation.error}`);
      return;
    }

    await executeWithLoading(async () => {
      const result = await memoService.sendMemo(memoText);
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

  const handleReadAccount = async () => {
    // Validate address using the service
    if (!accountService.validateAddress(accountToRead)) {
      setStatus("❌ Invalid Solana address format");
      return;
    }

    await executeWithLoading(async () => {
      const data = await accountService.readAccount(accountToRead);
      if (data) {
        setAccountData(data);
        setStatus("✅ Account data loaded successfully");
      } else {
        setStatus("❌ Failed to read account data");
      }
    }, "Reading account data");
  };

  const handleTransferSol = async () => {
    if (!solRecipient.trim() || !solAmount.trim()) {
      setStatus("❌ Please enter recipient address and amount");
      return;
    }

    // Validate address
    if (!accountService.validateAddress(solRecipient)) {
      setStatus("❌ Invalid recipient address");
      return;
    }

    // Validate amount
    const amount = parseFloat(solAmount);
    const amountValidation = systemService.validateAmount(amount);
    if (!amountValidation.valid) {
      setStatus(`❌ ${amountValidation.error}`);
      return;
    }

    await executeWithLoading(async () => {
      const result = await systemService.transfer(solRecipient, amount);
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
    }, "Transferring SOL");
  };

  const isValidSolanaAddress = (address: string): boolean => {
    return accountService.validateAddress(address);
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
                Contract Interactions
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
                📝 Memo Program 
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
              {memoText && !memoService.validateMessage(memoText).valid && (
                <Text variant="extraSmall" color="error" className="mt-1">
                  {memoService.validateMessage(memoText).error}
                </Text>
              )}
            </div>
            <Button
              onClick={handleSendMemo}
              disabled={
                isLoading || !memoService.validateMessage(memoText).valid
              }
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {memoService.loading ? "Sending..." : "Send Memo to Blockchain"}
            </Button>
          </CardContent>
        </Card>

        {/* SOL Transfer - Real Transaction */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
          <CardHeader>
            <CardTitle>
              <Text variant="h5" color="default">
                💰 SOL Transfer
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
                {solRecipient && !isValidSolanaAddress(solRecipient) && (
                  <Text variant="extraSmall" color="error" className="mt-1">
                    Invalid Solana address format
                  </Text>
                )}
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
                {solAmount &&
                  !systemService.validateAmount(parseFloat(solAmount))
                    .valid && (
                    <Text variant="extraSmall" color="error" className="mt-1">
                      {
                        systemService.validateAmount(parseFloat(solAmount))
                          .error
                      }
                    </Text>
                  )}
              </div>
            </div>
            <Button
              onClick={handleTransferSol}
              disabled={
                isLoading ||
                !solRecipient ||
                !solAmount ||
                !isValidSolanaAddress(solRecipient) ||
                !systemService.validateAmount(parseFloat(solAmount || "0"))
                  .valid
              }
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {systemService.loading ? "Transferring..." : "Transfer SOL"}
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
                isLoading ||
                !accountToRead ||
                !isValidSolanaAddress(accountToRead)
              }
              variant="outline"
              className="w-full"
            >
              {accountService.loading ? "Reading..." : "Read Account Data"}
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
                  <Text variant="small" color="default">
                    Rent Epoch: {accountData.rentEpoch}
                  </Text>
                  {accountData.explorerUrl && (
                    <div className="mt-2">
                      <a
                        href={accountData.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        View on Solana Explorer
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* DeFi Component */}
        <DeFi />

      

        {/* Service Status Display */}
        {(memoService.error || systemService.error || accountService.error) && (
          <Card>
            <CardContent>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <Text variant="small" weight="medium" color="error">
                  Service Errors:
                </Text>
                <div className="mt-2 space-y-1">
                  {memoService.error && (
                    <div className="flex justify-between items-center">
                      <Text variant="small" color="error">
                        Memo: {memoService.error}
                      </Text>
                      <Button
                        onClick={memoService.clearError}
                        variant="outline"
                        size="sm"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                  {systemService.error && (
                    <div className="flex justify-between items-center">
                      <Text variant="small" color="error">
                        System: {systemService.error}
                      </Text>
                      <Button
                        onClick={systemService.clearError}
                        variant="outline"
                        size="sm"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                  {accountService.error && (
                    <div className="flex justify-between items-center">
                      <Text variant="small" color="error">
                        Account: {accountService.error}
                      </Text>
                      <Button
                        onClick={accountService.clearError}
                        variant="outline"
                        size="sm"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Loading Indicator */}
        {isLoading && (
          <Card>
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <Text variant="small" weight="medium" color="primary">
                    Processing transaction...
                  </Text>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGate>
  );
};

// Helper component to display wallet balance
const WalletBalance: React.FC = () => {
  const systemService = useSystemService();
  const [balance, setBalance] = React.useState<number | null>(null);

  React.useEffect(() => {
    const loadBalance = async () => {
      const bal = await systemService.getBalance();
      setBalance(bal);
    };
    loadBalance();
  }, [systemService]);

  if (balance === null) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        <Text variant="small" color="muted">
          Loading balance...
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Text variant="small" weight="medium">
        Balance: {balance.toFixed(4)} SOL
      </Text>
    </div>
  );
};
