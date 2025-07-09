import { WalletConnection } from "@/components/ui/client/WalletConnection";
import { TransactionPanel } from "@/components/ui/client/TransactionPanel";
import { SolanaInfo } from "@/components/ui/client/SolanaInfo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Solana Wallet App
          </h1>
          <p className="text-gray-600">
            Connect your Phantom wallet and perform basic transactions
          </p>
        </header>
        
        <main className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* <SolanaInfo /> */}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <WalletConnection />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <TransactionPanel />
          </div>
        </main>
      </div>
    </div>
  );
}
