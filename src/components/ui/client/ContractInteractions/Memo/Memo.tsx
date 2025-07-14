import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Text,
} from "@/components/ui/common";

interface MemoProps {
  memoText: string;
  setMemoText: (text: string) => void;
  handleSendMemo: () => void;
  memoService: {
    loading: boolean;
    error: string | null;
    clearError: () => void;
    validateMessage: (text: string) => { valid: boolean; error?: string };
  };
  isLoading: boolean;
  status: string;
  setStatus: (status: string) => void;
}

export const Memo: React.FC<MemoProps> = ({
  memoText,
  setMemoText,
  handleSendMemo,
  memoService,
  isLoading,
  status,
  setStatus,
}) => {
  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
      <CardHeader>
        <CardTitle>
          <Text variant="h5" color="default">
            📝 Memo Program
          </Text>
        </CardTitle>
        <CardDescription>
          <Text variant="small" color="muted">
            Send a memo to the Solana blockchain using the official Memo program
          </Text>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block mb-2">
            <Text variant="small" weight="medium">
              Memo Message
            </Text>
          </label>
          <textarea
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            placeholder="Enter your memo message..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 resize-none"
            rows={3}
          />
          {memoText && !memoService.validateMessage(memoText).valid && (
            <Text variant="extraSmall" color="error" className="mt-1">
              {memoService.validateMessage(memoText).error}
            </Text>
          )}
        </div>
        <Button
          onClick={handleSendMemo}
          disabled={isLoading || !memoService.validateMessage(memoText).valid}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {memoService.loading ? "Sending..." : "Send Memo to Blockchain"}
        </Button>

        {/* Error Display */}
        {memoService.error && (
          <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <CardContent className="py-4">
              <div className="flex justify-between items-center">
                <Text color="error">{memoService.error}</Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={memoService.clearError}
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
          <Card
            className={
              status.includes("❌")
                ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                : status.includes("✅")
                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
            }
          >
            <CardContent className="py-4">
              <div className="flex justify-between items-center">
                <Text
                  color={
                    status.includes("❌")
                      ? "error"
                      : status.includes("✅")
                      ? "success"
                      : "primary"
                  }
                  className="break-all"
                >
                  {status}
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatus("")}
                  className="h-auto p-1  "
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
                <Text color="primary">Processing transaction...</Text>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
