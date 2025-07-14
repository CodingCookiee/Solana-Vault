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
  const [status, setStatus] = useState<string>("");

  const isValidSolanaAddress = (address: string): boolean => {
    return accountService.validateAddress(address);
  };

  const handleTransferSol = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setStatus("❌ Wallet not connected. Please connect your wallet.");
      return;
    }

    if (!solRecipient.trim() || !solAmount.trim()) {
      setStatus("❌ Please enter recipient address and amount");
      return;
    }

    if (!accountService.validateAddress(solRecipient)) {
      setStatus("❌ Invalid recipient address");
      return;
    }

    const amount = parseFloat(solAmount);
    const amountValidation = systemService.validateAmount(amount);
    if (!amountValidation.valid) {
      setStatus(`❌ ${amountValidation.error}`);
      return;
    }

    try {
      setStatus("⏳ Transferring SOL...");
      const result = await systemService.transfer(solRecipient, amount);
      
      if (result.success) {
        setStatus(`✅ Transferred ${amount} SOL successfully!`);
        if (result?.data.explorerUrl) {
          setStatus(`✅ Transfer successful! View on Explorer: ${result.data.explorerUrl}`);
        }
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
    }
  };

  return (
    <AuthGate>
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
          status={status}
          setStatus={setStatus}
        />
      </div>
   </AuthGate>
  );
}
