import { NFTContainer } from "@/components/ui/client/nft/NFTContainer";
import { Text } from "@/components/ui/common";

export default function NFTPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <Text variant="h1" color="primary" weight="bold" className="mb-4">
            Solana NFT Studio
          </Text>
          <Text
            variant="body"
            color="secondary"
            align="center"
            className="max-w-2xl mx-auto"
          >
            Create and manage NFT collections on Solana. Mint NFTs, organize
            them into collections, and verify their authenticity - all in one
            place.
          </Text>
        </header>

        <main>
          <NFTContainer />
        </main>
      </div>
    </div>
  );
}
