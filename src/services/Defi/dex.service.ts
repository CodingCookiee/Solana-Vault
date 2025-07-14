import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN, Idl } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
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
} from "./dex.types";

// Import IDL directly as JSON and cast to Idl
import dexIdlJson from "./dex.idl.json";
const dexIdl = dexIdlJson as unknown as Idl;

/**
 * Initialize user account
 */
export const initializeUser = async (
  connection: Connection,
  wallet: AnchorWallet
): Promise<DexServiceResult> => {
  try {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    // Create provider and program
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });

    const program = new Program(dexIdl, PROGRAM_ID, provider);

    // Get the client account PDA
    const [clientPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("client"), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    // Check if account exists by trying to get account info directly
    try {
      const accountInfo = await connection.getAccountInfo(clientPDA);
      if (accountInfo !== null) {
        return {
          signature: "",
          success: false,
          error: "Account already initialized",
        };
      }
    } catch (error) {
      console.log("Account doesn't exist yet, proceeding with initialization");
    }

    // Initialize the user account
    const tx = await program.methods
      .initUser()
      .accounts({
        client: clientPDA,
        signer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${tx}?cluster=${CLUSTER}`;

    return {
      signature: tx,
      success: true,
      explorerUrl,
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
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });
    const program = new Program(dexIdl, PROGRAM_ID, provider);

    const [solVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("sol_vault")],
      PROGRAM_ID
    );

    const [sfcVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("sfc_vault")],
      PROGRAM_ID
    );

    const [userPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("client"), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    const amountIn = new BN(params.amountIn * LAMPORTS_PER_SOL);

    const tx = await program.methods
      .buySol(amountIn)
      .accounts({
        vaultsol: solVault,
        vaultsfc: sfcVault,
        donator: userPDA,
        signer: wallet.publicKey,
        token: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${tx}?cluster=${CLUSTER}`;

    return {
      signature: tx,
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
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });
    const program = new Program(dexIdl, PROGRAM_ID, provider);

    const [solVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("sol_vault")],
      PROGRAM_ID
    );

    const [sfcVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("sfc_vault")],
      PROGRAM_ID
    );

    const [userPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("client"), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    const amountIn = new BN(params.amountIn * LAMPORTS_PER_SOL);
    const bump = new BN(params.bump);

    const tx = await program.methods
      .sellSol(amountIn, bump)
      .accounts({
        vaultsol: solVault,
        vaultsfc: sfcVault,
        donator: userPDA,
        signer: wallet.publicKey,
        token: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${tx}?cluster=${CLUSTER}`;

    return {
      signature: tx,
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
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });
    const program = new Program(dexIdl, PROGRAM_ID, provider);

    const [solVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("sol_vault")],
      PROGRAM_ID
    );

    const [sfcVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("sfc_vault")],
      PROGRAM_ID
    );

    const [mint] = PublicKey.findProgramAddressSync(
      [Buffer.from("lp_mint")],
      PROGRAM_ID
    );

    const [userSfcAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_sfc"), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    const [userLpAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_lp"), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    const amount = new BN(params.amount * LAMPORTS_PER_SOL);
    const bump = new BN(params.bump);

    const tx = await program.methods
      .provideLiquidity(amount, bump)
      .accounts({
        vaultsol: solVault,
        vaultsfc: sfcVault,
        mint: mint,
        donatorsfc: userSfcAccount,
        donatorlp: userLpAccount,
        token: TOKEN_PROGRAM_ID,
        signer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${tx}?cluster=${CLUSTER}`;

    return {
      signature: tx,
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
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });
    const program = new Program(dexIdl, PROGRAM_ID, provider);

    const [solVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("sol_vault")],
      PROGRAM_ID
    );

    const [sfcVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("sfc_vault")],
      PROGRAM_ID
    );

    const [mint] = PublicKey.findProgramAddressSync(
      [Buffer.from("lp_mint")],
      PROGRAM_ID
    );

    const [userSfcAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_sfc"), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    const [userLpAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_lp"), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    const amount = new BN(params.amount * LAMPORTS_PER_SOL);
    const bump = new BN(params.bump);

    const tx = await program.methods
      .withdrawLiquidity(amount, bump)
      .accounts({
        vaultsol: solVault,
        vaultsfc: sfcVault,
        mint: mint,
        donatorsfc: userSfcAccount,
        donatorlp: userLpAccount,
        token: TOKEN_PROGRAM_ID,
        signer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${tx}?cluster=${CLUSTER}`;

    return {
      signature: tx,
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
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });
    const program = new Program(dexIdl, PROGRAM_ID, provider);

    const [fromUserPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("client"), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    const [toUserPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("client"), params.flashTarget.toBuffer()],
      PROGRAM_ID
    );

    const amount = new BN(params.amount * LAMPORTS_PER_SOL);

    const tx = await program.methods
      .tranferAsset(params.flashTarget, amount)
      .accounts({
        toclient: toUserPDA,
        fromclient: fromUserPDA,
        signer: wallet.publicKey,
      })
      .rpc();

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${tx}?cluster=${CLUSTER}`;

    return {
      signature: tx,
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
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });
    const program = new Program(dexIdl, PROGRAM_ID, provider);

    const [userPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("client"), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    let tx: string;

    if (params.flashTarget) {
      // Send message to specific target
      const [targetPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("client"), params.flashTarget.toBuffer()],
        PROGRAM_ID
      );

      tx = await program.methods
        .userMessageTarget(params.flashTarget, params.message)
        .accounts({
          toclient: targetPDA,
          fromclient: userPDA,
          signer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } else {
      // Send general message
      tx = await program.methods
        .userMessage(params.message)
        .accounts({
          client: userPDA,
          signer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    }

    const explorerUrl = `${SOLANA_EXPLORER_BASE_URL}/tx/${tx}?cluster=${CLUSTER}`;

    return {
      signature: tx,
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
    const [solVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("sol_vault")],
      PROGRAM_ID
    );

    const [sfcVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("sfc_vault")],
      PROGRAM_ID
    );

    const solBalance = await connection.getBalance(solVault);
    const sfcAccountInfo = await connection.getAccountInfo(sfcVault);

    return {
      solVault,
      sfcVault,
      solBalance: solBalance / LAMPORTS_PER_SOL,
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
    const [userPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("client"), userPublicKey.toBuffer()],
      PROGRAM_ID
    );

    const solBalance = await connection.getBalance(userPublicKey);
    const accountInfo = await connection.getAccountInfo(userPDA);

    return {
      sol: solBalance / LAMPORTS_PER_SOL,
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
    const [userPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("client"), userPublicKey.toBuffer()],
      PROGRAM_ID
    );

    const accountInfo = await connection.getAccountInfo(userPDA);

    return {
      isInitialized: accountInfo !== null,
      userInfo: undefined, // Would need to deserialize from account data
      userTargets: undefined, // Would need to deserialize from account data
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
export const validateSwapParams = (
  params: SwapParams
): { valid: boolean; error?: string } => {
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
): { valid: boolean; error?: string } => {
  if (params.amount <= 0) {
    return { valid: false, error: "Amount must be greater than 0" };
  }

  if (params.bump < 0) {
    return { valid: false, error: "Bump must be non-negative" };
  }

  return { valid: true };
};
