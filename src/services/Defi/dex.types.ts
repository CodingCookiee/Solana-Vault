import { PublicKey } from "@solana/web3.js";
import { REAL_PROGRAMS } from "./index.ts";

/**
 * DeFi/DEX Program Types
 */

// Program constants
export const PROGRAM_ID = REAL_PROGRAMS.DEX;

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
}
