"use client";

import { DeFi } from "@/components/ui/client/ContractInteractions/Defi/DeFi";
import { AuthGate } from "@/components/ui/client/Auth/AuthGate";

export default function DeFiPage() {
  return (
    <AuthGate>
      <div className="max-w-4xl mx-auto p-6">
        <DeFi />
      </div>
    </AuthGate>
  );
}
