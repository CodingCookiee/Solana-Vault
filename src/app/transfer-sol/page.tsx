"use client";

import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { TransferSol } from "@/components/ui/client/ContractInteractions/TransferSol/TransferSol";
import { useSystemService } from "@/services/system";
import { useAccountService } from "@/services/account";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";

export default function TransferSolPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const systemService = useSystemService();
  const accountService = useAccountService();

  // State for SOL transfer
  const [solRecipient, setSolRecipient] = useState<string>("");
  const [solAmount, setSolAmount] = useState<string>("0.01");

  const isValidSolanaAddress = (address: string): boolean => {
    return accountService.validateAddress(address);
  };

  const handleTransferSol = async () => {
    if (!solRecipient.trim() || !solAmount.trim()) {
      return;
    }

    if (!accountService.validateAddress(solRecipient)) {
      return;
    }

    const amount = parseFloat(solAmount);
    const amountValidation = systemService.validateAmount(amount);
    if (!amountValidation.valid) {
      return;
    }

    await systemService.transfer(solRecipient, amount);
  };

  return (
    // <AuthGate>
      <div className="max-w-4xl mx-auto p-6">
        <TransferSol
          solRecipient={solRecipient}
          setSolRecipient={setSolRecipient}
          solAmount={solAmount}
          setSolAmount={setSolAmount}
          handleTransferSol={handleTransferSol}
          isValidSolanaAddress={isValidSolanaAddress}
          systemService={systemService}
          isLoading={systemService.loading}
        />
      </div>
    // </AuthGate>
  );
}
