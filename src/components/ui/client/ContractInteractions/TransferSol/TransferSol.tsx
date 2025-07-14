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

interface TransferSolProps {
  solRecipient: string;
  setSolRecipient: (address: string) => void;
  solAmount: string;
  setSolAmount: (amount: string) => void;
  handleTransferSol: () => void;
  isValidSolanaAddress: (address: string) => boolean;
  systemService: {
    loading: boolean;
    error: string | null;
    clearError: () => void;
    validateAmount: (amount: number) => { valid: boolean; error?: string };
  };
  isLoading: boolean;
  status: string;
  setStatus: (status: string) => void;
}

export const TransferSol: React.FC<TransferSolProps> = ({
  solRecipient,
  setSolRecipient,
  solAmount,
  setSolAmount,
  handleTransferSol,
  isValidSolanaAddress,
  systemService,
  isLoading,
  status,
  setStatus,
}) => {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
      <CardHeader>
        <CardTitle>
          <Text variant="h5" color="default">
            💰 SOL Transfer
          </Text>
        </CardTitle>
        <CardDescription>
          <Text variant="small" color="muted">
            Transfer SOL between accounts using the System Program
          </Text>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">
              <Text variant="small" weight="medium">
                Recipient Address
              </Text>
            </label>
            <input
              type="text"
              value={solRecipient}
              onChange={(e) => setSolRecipient(e.target.value)}
              placeholder="Enter recipient address..."
              className={`w-full p-3 border rounded-lg dark:bg-gray-800 ${
                solRecipient && !isValidSolanaAddress(solRecipient)
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : solRecipient && isValidSolanaAddress(solRecipient)
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {solRecipient && !isValidSolanaAddress(solRecipient) && (
              <Text variant="extraSmall" color="error" className="mt-1">
                Invalid Solana address format
              </Text>
            )}
          </div>
          <div>
            <label className="block mb-2">
              <Text variant="small" weight="medium">
                Amount (SOL)
              </Text>
            </label>
            <input
              type="number"
              value={solAmount}
              onChange={(e) => setSolAmount(e.target.value)}
              min="0"
              step="0.01"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
            />
            {solAmount &&
              !systemService.validateAmount(parseFloat(solAmount)).valid && (
                <Text variant="extraSmall" color="error" className="mt-1">
                  {systemService.validateAmount(parseFloat(solAmount)).error}
                </Text>
              )}
          </div>
        </div>
        <Button
          onClick={handleTransferSol}
          disabled={
            isLoading ||
            !solRecipient ||
            !solAmount ||
            !isValidSolanaAddress(solRecipient) ||
            !systemService.validateAmount(parseFloat(solAmount || "0")).valid
          }
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {systemService.loading ? "Transferring..." : "Transfer SOL"}
        </Button>

        {/* Error Display */}
        {systemService.error && (
          <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <CardContent className="py-4">
              <div className="flex justify-between items-center">
                <Text color="error">{systemService.error}</Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={systemService.clearError}
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
                <Text color="primary">Processing transfer...</Text>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
