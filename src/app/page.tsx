import { WalletConnection } from "@/components/ui/client/WalletConnect/WalletConnection";
import { TransactionPanel } from "@/components/ui/client/TransactionPanel/TransactionPanel";
import { ProgramInteractions } from "@/components/ui/client/ProgramInteractions/ProgramInteractions";
import { DevnetTokenOps } from "@/components/ui/client/DevnetTokenOps";
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
          <section>
            <ProgramInteractions />
          </section>

          

          {/* Devnet Token Operations */}
          <section>
            <DevnetTokenOps />
          </section>

          {/* Information Cards */}
          {/* <section className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <Text variant="h6" color="primary" weight="semibold">
                  Secure & Safe
                </Text>
              </div>
              <Text variant="small" color="muted">
                Your private keys never leave your wallet. All transactions are
                signed locally and sent securely to the Solana network.
              </Text>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <Text variant="h6" color="primary" weight="semibold">
                  Lightning Fast
                </Text>
              </div>
              <Text variant="small" color="muted">
                Built on Solana's high-performance blockchain. Experience
                near-instant transactions with minimal fees.
              </Text>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <Text variant="h6" color="primary" weight="semibold">
                  SPL Tokens
                </Text>
              </div>
              <Text variant="small" color="muted">
                Create, mint, transfer, and manage SPL tokens. Full support for
                token operations and program interactions.
              </Text>
            </div>
          </section> */}

          {/* Features Overview */}
          {/* <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-8">
              <Text variant="h4" color="primary" weight="bold" className="mb-4">
                What You Can Do
              </Text>
              <Text
                variant="body"
                color="muted"
                align="center"
                className="max-w-3xl mx-auto"
              >
                This application demonstrates various Solana blockchain
                interactions, from basic wallet operations to advanced SPL token
                management.
              </Text>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <Text variant="h6" weight="semibold">
                  Wallet Connection
                </Text>
                <Text variant="small" color="muted">
                  Connect and authenticate with Phantom wallet
                </Text>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <Text variant="h6" weight="semibold">
                  SOL Transactions
                </Text>
                <Text variant="small" color="muted">
                  Send SOL to other addresses with validation
                </Text>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <Text variant="h6" weight="semibold">
                  Token Creation
                </Text>
                <Text variant="small" color="muted">
                  Create custom SPL tokens with configurable decimals
                </Text>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <Text variant="h6" weight="semibold">
                  Token Operations
                </Text>
                <Text variant="small" color="muted">
                  Mint, transfer, burn, and approve token operations
                </Text>
              </div>
            </div>
          </section> */}
          {/* Footer */}
          {/* <footer className="text-center py-8 border-t border-gray-200 dark:border-gray-700 mt-16">
            <div className="space-y-4">
              <div className="flex justify-center space-x-6">
                <Text variant="small" color="muted">
                  Built with Next.js
                </Text>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Text variant="small" color="muted">
                  Powered by Solana
                </Text>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Text variant="small" color="muted">
                  Styled with Tailwind CSS
                </Text>
              </div>
              <Text variant="extraSmall" color="muted" align="center">
                © 2024 Solana Wallet App. Built for learning and development
                purposes.
              </Text>
              <div className="flex justify-center space-x-4 mt-4">
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Devnet</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>SPL Token Program</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Phantom Wallet</span>
                </div>
              </div>
            </div>
          </footer> */}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal />
    </div>
  );
}
