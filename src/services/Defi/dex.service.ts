import {
  Connection,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { web3, BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SOLANA_EXPLORER_BASE_URL, CLUSTER } from "../solana/constants";
import {
  PROGRAM_ID,
  DexServiceResult,
  SwapParams,
  LiquidityParams,
  AssetTransferParams,
  MessageParams,
  PoolInfo,
  UserBalance,
  TradeQuote,
  UserInfor,
  UserTarget,
  AccountState,
  ValidationResult,
} from "./dex.types";
import {
  getDexAnchorProgram,
  getReadOnlyDexProgram,
  deriveDexPDAs,
  checkUserInitialized,
  toBN,
  fromBN,
} from "./dex.anchor";

/**
 * Initialize user account using Anchor
 */
export const initializeUser = async (
  connection: Connection,
  wallet: AnchorWallet
): Promise<DexServiceResult> => {
  try {
    console.log("Starting user initialization...");

    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    console.log("Wallet public key:", wallet.publicKey.toString());

    // Check if user is already initialized
    const isInitialized = await checkUserInitialized(
      connection,
      wallet.publicKey
    );
    if (isInitialized) {
      return {
        signature: "",
        success: false,
        error: "Account already initialized",
      };
    }

    console.log("Creating Anchor program...");

    // Get Anchor program instance
    const program = getDexAnchorProgram(connection, wallet);

    console.log("Program created successfully");

    // Derive client PDA
    const [clientPDA] = deriveDexPDAs.client(wallet.publicKey);

    console.log("Client PDA:", clientPDA.toString());

    // Call the initUser RPC method
    console.log("Calling initUser method...");
    const txn = await program.methods
      .initUser()
      .accounts({
        client: clientPDA,
        signer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Transaction signature:", txn);

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
      success: true,
      explorerUrl,
      pda: clientPDA.toString(),
    };
  } catch (error) {
    console.error("Error initializing user:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Buy SOL with SFC tokens
 */
export const buySol = async (
  connection: Connection,
  wallet: AnchorWallet,
  params: SwapParams
): Promise<DexServiceResult> => {
  try {
    const program = getDexAnchorProgram(connection, wallet);

    const [solVault] = deriveDexPDAs.solVault();
    const [sfcVault] = deriveDexPDAs.sfcVault();
    const [userPDA] = deriveDexPDAs.client(wallet.publicKey!);

    const amountIn = toBN(params.amountIn);

    const txn = await program.methods
      .buySol(amountIn)
      .accounts({
        vaultsol: solVault,
        vaultsfc: sfcVault,
        donator: userPDA,
        signer: wallet.publicKey!,
        token: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
      success: true,
      explorerUrl,
    };
  } catch (error) {
    console.error("Error buying SOL:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Sell SOL for SFC tokens
 */
export const sellSol = async (
  connection: Connection,
  wallet: AnchorWallet,
  params: SwapParams & { bump: number }
): Promise<DexServiceResult> => {
  try {
    const program = getDexAnchorProgram(connection, wallet);

    const [solVault] = deriveDexPDAs.solVault();
    const [sfcVault] = deriveDexPDAs.sfcVault();
    const [userPDA] = deriveDexPDAs.client(wallet.publicKey!);

    const amountIn = toBN(params.amountIn);
    const bump = new BN(params.bump);

    const txn = await program.methods
      .sellSol(amountIn, bump)
      .accounts({
        vaultsol: solVault,
        vaultsfc: sfcVault,
        donator: userPDA,
        signer: wallet.publicKey!,
        token: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
      success: true,
      explorerUrl,
    };
  } catch (error) {
    console.error("Error selling SOL:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Provide liquidity to the pool
 */
export const provideLiquidity = async (
  connection: Connection,
  wallet: AnchorWallet,
  params: LiquidityParams
): Promise<DexServiceResult> => {
  try {
    const program = getDexAnchorProgram(connection, wallet);

    const [solVault] = deriveDexPDAs.solVault();
    const [sfcVault] = deriveDexPDAs.sfcVault();
    const [mint] = deriveDexPDAs.lpMint();
    const [userSfcAccount] = deriveDexPDAs.userSfcAccount(wallet.publicKey!);
    const [userLpAccount] = deriveDexPDAs.userLpAccount(wallet.publicKey!);

    const amount = toBN(params.amount);
    const bump = new BN(params.bump);

    const txn = await program.methods
      .provideLiquidity(amount, bump)
      .accounts({
        vaultsol: solVault,
        vaultsfc: sfcVault,
        mint: mint,
        donatorsfc: userSfcAccount,
        donatorlp: userLpAccount,
        token: TOKEN_PROGRAM_ID,
        signer: wallet.publicKey!,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
      success: true,
      explorerUrl,
    };
  } catch (error) {
    console.error("Error providing liquidity:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Withdraw liquidity from the pool
 */
export const withdrawLiquidity = async (
  connection: Connection,
  wallet: AnchorWallet,
  params: LiquidityParams
): Promise<DexServiceResult> => {
  try {
    const program = getDexAnchorProgram(connection, wallet);

    const [solVault] = deriveDexPDAs.solVault();
    const [sfcVault] = deriveDexPDAs.sfcVault();
    const [mint] = deriveDexPDAs.lpMint();
    const [userSfcAccount] = deriveDexPDAs.userSfcAccount(wallet.publicKey!);
    const [userLpAccount] = deriveDexPDAs.userLpAccount(wallet.publicKey!);

    const amount = toBN(params.amount);
    const bump = new BN(params.bump);

    const txn = await program.methods
      .withdrawLiquidity(amount, bump)
      .accounts({
        vaultsol: solVault,
        vaultsfc: sfcVault,
        mint: mint,
        donatorsfc: userSfcAccount,
        donatorlp: userLpAccount,
        token: TOKEN_PROGRAM_ID,
        signer: wallet.publicKey!,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
      success: true,
      explorerUrl,
    };
  } catch (error) {
    console.error("Error withdrawing liquidity:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Transfer assets between users
 */
export const transferAsset = async (
  connection: Connection,
  wallet: AnchorWallet,
  params: AssetTransferParams
): Promise<DexServiceResult> => {
  try {
    const program = getDexAnchorProgram(connection, wallet);

    const [fromUserPDA] = deriveDexPDAs.client(wallet.publicKey!);
    const [toUserPDA] = deriveDexPDAs.client(params.flashTarget);

    const amount = toBN(params.amount);

    const txn = await program.methods
      .tranferAsset(params.flashTarget, amount)
      .accounts({
        toclient: toUserPDA,
        fromclient: fromUserPDA,
        signer: wallet.publicKey!,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
      success: true,
      explorerUrl,
    };
  } catch (error) {
    console.error("Error transferring asset:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Send a message to another user
 */
export const sendMessage = async (
  connection: Connection,
  wallet: AnchorWallet,
  params: MessageParams
): Promise<DexServiceResult> => {
  try {
    const program = getDexAnchorProgram(connection, wallet);

    const [userPDA] = deriveDexPDAs.client(wallet.publicKey!);

    let txn: string;

    if (params.flashTarget) {
      // Send message to specific target
      const [targetPDA] = deriveDexPDAs.client(params.flashTarget);

      txn = await program.methods
        .userMessageTarget(params.flashTarget, params.message)
        .accounts({
          toclient: targetPDA,
          fromclient: userPDA,
          signer: wallet.publicKey!,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } else {
      // Send general message
      txn = await program.methods
        .userMessage(params.message)
        .accounts({
          client: userPDA,
          signer: wallet.publicKey!,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    }

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
      success: true,
      explorerUrl,
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Get pool information
 */
export const getPoolInfo = async (
  connection: Connection
): Promise<PoolInfo | null> => {
  try {
    const [solVault] = deriveDexPDAs.solVault();
    const [sfcVault] = deriveDexPDAs.sfcVault();

    const solBalance = await connection.getBalance(solVault);
    const sfcAccountInfo = await connection.getAccountInfo(sfcVault);

    return {
      solVault,
      sfcVault,
      solBalance: fromBN(new BN(solBalance)),
      sfcBalance: sfcAccountInfo ? 0 : 0, // Would need to parse token account
      lpTokenSupply: 0, // Would need to fetch from mint
      kConstant: 0, // Would calculate from balances
    };
  } catch (error) {
    console.error("Error getting pool info:", error);
    return null;
  }
};

/**
 * Get user balance
 */
export const getUserBalance = async (
  connection: Connection,
  userPublicKey: PublicKey
): Promise<UserBalance | null> => {
  try {
    const [userPDA] = deriveDexPDAs.client(userPublicKey);

    const solBalance = await connection.getBalance(userPublicKey);
    const accountInfo = await connection.getAccountInfo(userPDA);

    return {
      sol: fromBN(new BN(solBalance)),
      sfc: 0, // Would need to parse from account data
      lpTokens: 0, // Would need to parse from account data
    };
  } catch (error) {
    console.error("Error getting user balance:", error);
    return null;
  }
};

/**
 * Get trade quote
 */
export const getTradeQuote = async (
  connection: Connection,
  inputAmount: number,
  isSOLtoSFC: boolean
): Promise<TradeQuote | null> => {
  try {
    const poolInfo = await getPoolInfo(connection);
    if (!poolInfo) return null;

    // Simple constant product formula (x * y = k)
    // This would need to be adjusted based on actual pool mechanics
    const fee = 0.003; // 0.3% fee
    const inputAfterFee = inputAmount * (1 - fee);

    let outputAmount: number;
    if (isSOLtoSFC) {
      // SOL to SFC
      outputAmount =
        (poolInfo.sfcBalance * inputAfterFee) /
        (poolInfo.solBalance + inputAfterFee);
    } else {
      // SFC to SOL
      outputAmount =
        (poolInfo.solBalance * inputAfterFee) /
        (poolInfo.sfcBalance + inputAfterFee);
    }

    const priceImpact = Math.abs(outputAmount - inputAmount) / inputAmount;
    const minimumReceived = outputAmount * 0.99; // 1% slippage tolerance

    return {
      inputAmount,
      outputAmount,
      priceImpact,
      minimumReceived,
      fee: inputAmount * fee,
    };
  } catch (error) {
    console.error("Error getting trade quote:", error);
    return null;
  }
};

/**
 * Get user account state
 */
export const getUserAccountState = async (
  connection: Connection,
  userPublicKey: PublicKey
): Promise<AccountState> => {
  try {
    const [userPDA] = deriveDexPDAs.client(userPublicKey);

    const accountInfo = await connection.getAccountInfo(userPDA);
    const isInitialized = accountInfo !== null;

    let userInfo: UserInfor | undefined;
    let userTargets: UserTarget | undefined;

    if (isInitialized) {
      try {
        const program = getReadOnlyDexProgram(connection, userPublicKey);
        const userAccount = await program.account.userInfor.fetch(userPDA);

        userInfo = {
          assetAccount: userAccount.assetAccount.toNumber(),
          accountName: userAccount.accountName,
          kValue: userAccount.kValue,
        };
      } catch (error) {
        console.log("Could not fetch user account data:", error);
      }
    }

    return {
      isInitialized,
      userInfo,
      userTargets,
    };
  } catch (error) {
    console.error("Error getting user account state:", error);
    return {
      isInitialized: false,
    };
  }
};

/**
 * Validate transaction parameters
 */
export const validateSwapParams = (params: SwapParams): ValidationResult => {
  if (params.amountIn <= 0) {
    return { valid: false, error: "Amount must be greater than 0" };
  }

  if (params.slippage && (params.slippage < 0 || params.slippage > 1)) {
    return { valid: false, error: "Slippage must be between 0 and 1" };
  }

  return { valid: true };
};

export const validateLiquidityParams = (
  params: LiquidityParams
): ValidationResult => {
  if (params.amount <= 0) {
    return { valid: false, error: "Amount must be greater than 0" };
  }

  if (params.bump < 0) {
    return { valid: false, error: "Bump must be non-negative" };
  }

  return { valid: true };
};

/**
 * Validate message parameters
 */
export const validateMessageParams = (
  params: MessageParams
): ValidationResult => {
  if (!params.message || !params.message.trim()) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (params.message.length > 280) {
    return { valid: false, error: "Message must be 280 characters or less" };
  }

  return { valid: true };
};

/**
 * Validate transfer parameters
 */
export const validateTransferParams = (
  params: AssetTransferParams
): ValidationResult => {
  if (params.amount <= 0) {
    return { valid: false, error: "Amount must be greater than 0" };
  }

  if (!params.flashTarget) {
    return { valid: false, error: "Target address is required" };
  }

  return { valid: true };
};

/**
 * Helper function to check if program is deployed
 */
export const isProgramDeployed = async (
  connection: Connection
): Promise<boolean> => {
  try {
    const programAccount = await connection.getAccountInfo(PROGRAM_ID);
    return programAccount !== null && programAccount.executable;
  } catch (error) {
    console.error("Error checking program deployment:", error);
    return false;
  }
};

/**
 * Helper function to get program info
 */
export const getProgramInfo = async (connection: Connection) => {
  try {
    const programAccount = await connection.getAccountInfo(PROGRAM_ID);
    return {
      exists: programAccount !== null,
      executable: programAccount?.executable || false,
      owner: programAccount?.owner.toString(),
      lamports: programAccount?.lamports || 0,
    };
  } catch (error) {
    console.error("Error getting program info:", error);
    return null;
  }
};

/**
 * Change user account name
 */
export const changeName = async (
  connection: Connection,
  wallet: AnchorWallet,
  name: string
): Promise<DexServiceResult> => {
  try {
    if (!name || !name.trim()) {
      return {
        signature: "",
        success: false,
        error: "Name cannot be empty",
      };
    }

    const program = getDexAnchorProgram(connection, wallet);
    const [clientPDA] = deriveDexPDAs.client(wallet.publicKey!);

    const txn = await program.methods
      .changeName(name)
      .accounts({
        client: clientPDA,
        signer: wallet.publicKey!,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
      success: true,
      explorerUrl,
    };
  } catch (error) {
    console.error("Error changing name:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Clear user account
 */
export const clearUser = async (
  connection: Connection,
  wallet: AnchorWallet
): Promise<DexServiceResult> => {
  try {
    const program = getDexAnchorProgram(connection, wallet);
    const [clientPDA] = deriveDexPDAs.client(wallet.publicKey!);

    const txn = await program.methods
      .clearUser()
      .accounts({
        client: clientPDA,
        signer: wallet.publicKey!,
        solDestination: wallet.publicKey!,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${txn}?cluster=${CLUSTER}`;

    return {
      signature: txn,
      success: true,
      explorerUrl,
    };
  } catch (error) {
    console.error("Error clearing user:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
