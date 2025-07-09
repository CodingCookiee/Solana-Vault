import { WalletConnection } from "@/components/ui/client/WalletConnection";
import { TransactionPanel } from "@/components/ui/client/TransactionPanel";
import { AuthModal } from "@/components/ui/client/AuthModal";
import { AuthFlowInfo } from "@/components/ui/client/AuthFlowInfo";
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
              Connect your Phantom wallet and perform basic transactions on the
              Solana blockchain. Manage your SOL balance and send transactions
              securely.
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
                  Instant Transactions
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
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
                <Text variant="h6" color="primary" weight="semibold">
                  Easy to Use
                </Text>
              </div>
              <Text variant="small" color="muted">
                Simple and intuitive interface designed for both beginners and
                experienced users. Get started in seconds.
              </Text>
            </div>
          </section> */}

          {/* Footer */}
          <footer className="text-center py-8 border-t border-gray-200 dark:border-gray-700 mt-16">
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
            </div>
          </footer>
        </main>
      </div>
      
      {/* Auth Modal */}
      {/* <AuthModal /> */}
    </div>
  );
}
