import { WalletConnection } from "@/components/ui/client/WalletConnect/WalletConnection";
import { TransactionPanel } from "@/components/ui/client/TransactionPanel/TransactionPanel";
// import { SPLProgramInteractions } from "@/components/ui/client/SPL_ProgramInteractions/SPL_ProgramInteractions";
import { ContractInteractions } from "@/components/ui/client/ContractInteractions/ContractInteractions";
import { AirDrop } from "@/components/ui/client/AirDrop";
import { AuthModal } from "@/components/ui/client/Auth/AuthModal";
import { AuthFlowInfo } from "@/components/ui/client/Auth/AuthFlowInfo";
import { Text } from "@/components/ui/common";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <Text variant="h1" color="primary" weight="bold">
                Solana Wallet App
              </Text>
            </div>
            <Text
              variant="body"
              color="secondary"
              align="center"
              className="max-w-2xl mx-auto"
            >
              Connect your Phantom wallet and interact with Solana programs.
              Manage your SOL balance, send transactions, and work with SPL
              tokens.
            </Text>

            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Text variant="small" color="muted" weight="medium">
                  Secure Wallet Connection
                </Text>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <Text variant="small" color="muted" weight="medium">
                  Real-time Balance
                </Text>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <Text variant="small" color="muted" weight="medium">
                  SPL Token Operations
                </Text>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <Text variant="small" color="muted" weight="medium">
                  Program Interactions
                </Text>
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          {/* Auth Flow Info */}
          <AuthFlowInfo />

          {/* Wallet Connection Section */}
          <section>
            <WalletConnection />
          </section>

          {/* Transaction Panel Section */}
          <section>
            <TransactionPanel />
          </section>

          {/* SPL Token Program Interactions */}
          {/* <section>
            <SPLProgramInteractions />
          </section> */}

          {/* Devnet Token Operations */}
          <section>
            <AirDrop />
          </section>

          {/* Contract Interactions */}
          <section>
            <ContractInteractions />
          </section>
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal />
    </div>
  );
}
