"use client";

import React from "react";
import { Card, CardContent, Button, Text } from "@/components/ui/common";

interface StatusDisplayProps {
  status: string;
  onClear: () => void;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  status,
  onClear,
}) => {
  if (!status) return null;

  return (
    <Card>
      <CardContent>
        <div
          className={`p-4 rounded-lg border ${
            status.includes("❌")
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              : status.includes("✅")
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <Text
                variant="small"
                weight="medium"
                className="whitespace-pre-line break-all"
              >
                {status}
              </Text>
            </div>
            {status.includes("✅") && (
              <Button
                onClick={onClear}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
