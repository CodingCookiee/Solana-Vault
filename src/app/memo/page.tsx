"use client";

import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Memo } from "@/components/ui/client/ContractInteractions/Memo/Memo";
import { useMemoService } from "@/services/memo";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";

export default function MemoPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const memoService = useMemoService();

  // State for memo
  const [memoText, setMemoText] = useState<string>("This is a memo from my dApp!");
  const [status, setStatus] = useState<string>("");

  const handleSendMemo = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setStatus("❌ Wallet not connected. Please connect your wallet.");
      return;
    }

    const validation = memoService.validateMessage(memoText);
    if (!validation.valid) {
      setStatus(`❌ ${validation.error}`);
      return;
    }

    try {
      setStatus("⏳ Sending memo...");
      const result = await memoService.sendMemo(memoText);
      
      setStatus(`✅ Memo sent successfully!`);
        if (result.data?.explorerUrl) {
          setStatus(
            `✅ Memo sent! View on Explorer: ${result.data.explorerUrl}`
          );
        }
       else {
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
        <Memo
          memoText={memoText}
          setMemoText={setMemoText}
          handleSendMemo={handleSendMemo}
          memoService={memoService}
          isLoading={memoService.loading}
          status={status}
          setStatus={setStatus}
        />
      </div>
    </AuthGate>
  );
}
