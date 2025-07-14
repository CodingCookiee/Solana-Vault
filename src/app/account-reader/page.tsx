"use client";

import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AccountReader } from "@/components/ui/client/ContractInteractions/AccountReader/AccountReader";
import { useAccountService } from "@/services/account";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";

export default function AccountReaderPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const accountService = useAccountService();

  // State for account reader
  const [accountToRead, setAccountToRead] = useState<string>("");
  const [accountData, setAccountData] = useState<any>(null);
  const [status, setStatus] = useState<string>("");

  const isValidSolanaAddress = (address: string): boolean => {
    return accountService.validateAddress(address);
  };

  const handleReadAccount = async () => {
    if (!accountService.validateAddress(accountToRead)) {
      setStatus("❌ Invalid Solana address format");
      return;
    }

    try {
      setStatus("⏳ Reading account data...");
      const data = await accountService.readAccount(accountToRead);
      if (data) {
        setAccountData(data);
        setStatus("✅ Account data loaded successfully");
      } else {
        setStatus("❌ Failed to read account data");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
    }
  };

  return (
    <AuthGate>
      <div className="max-w-4xl mx-auto p-6">
        <AccountReader
          accountToRead={accountToRead}
          setAccountToRead={setAccountToRead}
          accountData={accountData}
          handleReadAccount={handleReadAccount}
          isValidSolanaAddress={isValidSolanaAddress}
          accountService={accountService}
          isLoading={accountService.loading}
          status={status}
          setStatus={setStatus}
        />
      </div>
    </AuthGate>
  );
}
