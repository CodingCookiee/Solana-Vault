export type SystemTransferResult = {
  signature: string;
  success: boolean;
  error?: string;
  explorerUrl?: string;
};

export type SystemAccountResult = {
  signature: string;
  accountAddress: string;
  success: boolean;
  error?: string;
};