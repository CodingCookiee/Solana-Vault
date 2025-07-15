import { PublicKey } from "@solana/web3.js";
import { Idl } from "@coral-xyz/anchor";

/**
 * DeFi/DEX Program Types with Anchor Support
 */

// Program constants - use the actual program ID from your IDL
export const PROGRAM_ID = new PublicKey("F7TehQFrx3XkuMsLPcmKLz44UxTWWfyodNLSungdqoRX");

// Anchor Program Type Definition
export type SfcvndProgram = {
  version: "0.1.0";
  name: "sfcvnd";
  address: "F7TehQFrx3XkuMsLPcmKLz44UxTWWfyodNLSungdqoRX";
  instructions: [
    {
      name: "initUser";
      accounts: [
        {
          name: "client";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "UserInfor";
      type: {
        kind: "struct";
        fields: [
          {
            name: "assetAccount";
            type: "u64";
          },
          {
            name: "accountName";
            type: "string";
          },
          {
            name: "kValue";
            type: "f64";
          }
        ];
      };
    }
  ];
};

// IDL for Anchor Program (imported from JSON file)
import idlJson from "./dex.idl.json";
export const DEX_IDL: Idl = idlJson as Idl;

// Account types from IDL
export interface UserInfor {
  assetAccount: number;
  accountName: string;
  kValue: number;
}

export interface UserTarget {
  assetTarget: PublicKey[];
}

// Transaction result types
export interface DexTransactionResult {
  signature: string;
  success: boolean;
  error?: string;
  explorerUrl?: string;
}

// Trading operation types
export interface SwapParams {
  amountIn: number;
  minimumAmountOut?: number;
  slippage?: number;
}

export interface LiquidityParams {
  amount: number;
  bump: number;
}

export interface AssetTransferParams {
  flashTarget: PublicKey;
  amount: number;
}

export interface MessageParams {
  message: string;
  flashTarget?: PublicKey;
}

// Pool information
export interface PoolInfo {
  solVault: PublicKey;
  sfcVault: PublicKey;
  solBalance: number;
  sfcBalance: number;
  lpTokenSupply: number;
  kConstant: number;
}

// User balance information
export interface UserBalance {
  sol: number;
  sfc: number;
  lpTokens: number;
}

// Trade quote
export interface TradeQuote {
  inputAmount: number;
  outputAmount: number;
  priceImpact: number;
  minimumReceived: number;
  fee: number;
}

// Error types based on IDL
export enum DexErrorCode {
  PriceUnderSlippage = 6000,
  PriceOverSlippage = 6001,
  NotEnoughVND = 6002,
  NotEnoughSFCVND = 6003,
  VaultNotEnoughSFCVND = 6004,
  YouNotEnoughSFCVND = 6005,
  YouNotEnoughLPSFC = 6006,
  NotEnoughSol = 6007,
  VaultNotEnoughSol = 6008,
  YouNotEnoughSol = 6009,
  AccountNotEmpty = 6010,
  InvalidAmount = 6011,
  InvalidTargetKey = 6012,
  AccountAlreadyInitialized = 6013,
  Unauthorized = 6014,
  InvalidAuthority = 6015,
  NameIsEmpty = 6016,
  MessageIsEmpty = 6017,
}

// Account states
export interface AccountState {
  isInitialized: boolean;
  userInfo?: UserInfor;
  userTargets?: UserTarget;
}

export interface DexServiceResult extends DexTransactionResult {
  data?: any;
  pda?: string;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  error?: string;
}
