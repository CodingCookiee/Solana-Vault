import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button, 
  Text 
} from "@/components/ui/common";

interface AccountReaderProps {
  accountToRead: string;
  setAccountToRead: (address: string) => void;
  accountData: any;
  handleReadAccount: () => void;
  isValidSolanaAddress: (address: string) => boolean;
  accountService: {
    loading: boolean;
    error: string | null;
    clearError: () => void;
  };
  isLoading: boolean;
  status: string;
  setStatus: (status: string) => void;
}

export const AccountReader: React.FC<AccountReaderProps> = ({
  accountToRead,
  setAccountToRead,
  accountData,
  handleReadAccount,
  isValidSolanaAddress,
  accountService,
  isLoading,
  status,
  setStatus,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Text variant="h5" color="default">
            🔍 Account Data Reader
          </Text>
        </CardTitle>
        <CardDescription>
          <Text variant="small" color="muted">
            Read raw account data from any Solana account
          </Text>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block mb-2">
            <Text variant="small" weight="medium">
              Account Address
            </Text>
          </label>
          <input
            type="text"
            value={accountToRead}
            onChange={(e) => setAccountToRead(e.target.value)}
            placeholder="Enter Solana account address..."
            className={`w-full p-3 border rounded-lg dark:bg-gray-800 ${
              accountToRead && !isValidSolanaAddress(accountToRead)
                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                : accountToRead && isValidSolanaAddress(accountToRead)
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-gray-300 dark:border-gray-600"
            }`}
          />
          {accountToRead && !isValidSolanaAddress(accountToRead) && (
            <Text variant="extraSmall" color="error" className="mt-1">
              Invalid Solana address format
            </Text>
          )}
        </div>
        <Button
          onClick={handleReadAccount}
          disabled={
            isLoading || !accountToRead || !isValidSolanaAddress(accountToRead)
          }
          variant="outline"
          className="w-full"
        >
          {accountService.loading ? "Reading..." : "Read Account Data"}
        </Button>

        {accountData && (
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <Text variant="small" weight="semibold" color="primary">
              Account Information:
            </Text>
            <div className="mt-2 space-y-1">
              <Text variant="small" color="default">
                Owner: {accountData.owner}
              </Text>
              <Text variant="small" color="default">
                Balance: {accountData.lamports / 1e9} SOL
              </Text>
              <Text variant="small" color="default">
                Data Length: {accountData.dataLength} bytes
              </Text>
              <Text variant="small" color="default">
                Executable: {accountData.executable ? "Yes" : "No"}
              </Text>
              <Text variant="small" color="default">
                Rent Epoch: {accountData.rentEpoch}
              </Text>
              {accountData.explorerUrl && (
                <div className="mt-2">
                  <a
                    href={accountData.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    View on Solana Explorer
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {accountService.error && (
          <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <CardContent className="py-4">
              <div className="flex justify-between items-center">
                <Text color="error">{accountService.error}</Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={accountService.clearError}
                  className="text-red-500 hover:text-red-700 h-auto p-1"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Display */}
        {status && (
          <Card className={
            status.includes("❌")
              ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              : status.includes("✅")
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
          }>
            <CardContent className="py-4">
              <div className="flex justify-between items-center">
                <Text color={
                  status.includes("❌") ? "error" :
                  status.includes("✅") ? "success" : "primary"
                } className="break-all">
                  {status}
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatus("")}
                  className="h-auto p-1"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <Text color="primary">Processing request...</Text>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
