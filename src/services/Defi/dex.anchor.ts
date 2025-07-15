import { Program, AnchorProvider, web3, BN, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PROGRAM_ID, DEX_IDL } from "./dex.types";

/**
 * Get Anchor Program instance for DeFi operations
 */
export const getDexAnchorProgram = (
  connection: Connection,
  wallet: AnchorWallet
) => {
  try {
    // Validate inputs
    if (!connection) {
      throw new Error("Connection is required");
    }
    if (!wallet) {
      throw new Error("Wallet is required");
    }
    if (!wallet.publicKey) {
      throw new Error("Wallet public key is required");
    }

    // Create provider
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });

    // Validate program ID
    if (!PROGRAM_ID) {
      throw new Error("Program ID is not defined");
    }

    console.log("Creating program with ID:", PROGRAM_ID.toString());
    console.log("IDL:", DEX_IDL);

    // Create and return program
    return new Program(DEX_IDL, PROGRAM_ID, provider);
  } catch (error) {
    console.error("Error creating Anchor program:", error);
    throw error;
  }
};

/**
 * Create a read-only program instance for fetching data
 */
export const getReadOnlyDexProgram = (
  connection: Connection,
  publicKey: PublicKey
) => {
  try {
    const dummyWallet = {
      publicKey,
      signTransaction: async () => {
        throw new Error("Read-only operation");
      },
      signAllTransactions: async () => {
        throw new Error("Read-only operation");
      },
    } as AnchorWallet;

    const provider = new AnchorProvider(connection, dummyWallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });

    return new Program(DEX_IDL, PROGRAM_ID, provider);
  } catch (error) {
    console.error("Error creating read-only program:", error);
    throw error;
  }
};

/**
 * Derive common PDAs for DeFi operations
 */
export const deriveDexPDAs = {
  /**
   * Derive client PDA
   */
  client: (userPublicKey: PublicKey): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("client"), userPublicKey.toBuffer()],
      PROGRAM_ID
    );
  },

  /**
   * Derive SOL vault PDA
   */
  solVault: (): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("sol_vault")],
      PROGRAM_ID
    );
  },

  /**
   * Derive SFC vault PDA
   */
  sfcVault: (): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("sfc_vault")],
      PROGRAM_ID
    );
  },

  /**
   * Derive LP mint PDA
   */
  lpMint: (): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("lp_mint")],
      PROGRAM_ID
    );
  },

  /**
   * Derive user SFC account PDA
   */
  userSfcAccount: (userPublicKey: PublicKey): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("user_sfc"), userPublicKey.toBuffer()],
      PROGRAM_ID
    );
  },

  /**
   * Derive user LP account PDA
   */
  userLpAccount: (userPublicKey: PublicKey): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("user_lp"), userPublicKey.toBuffer()],
      PROGRAM_ID
    );
  },
};

/**
 * Check if user account is initialized
 */
export const checkUserInitialized = async (
  connection: Connection,
  userPublicKey: PublicKey
): Promise<boolean> => {
  try {
    const program = getReadOnlyDexProgram(connection, userPublicKey);
    const [clientPDA] = deriveDexPDAs.client(userPublicKey);

    await program.account.userInfor.fetch(clientPDA);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Convert number to BN with proper scaling for SOL (9 decimals)
 */
export const toBN = (amount: number, decimals: number = 9): BN => {
  return new BN(amount * Math.pow(10, decimals));
};

/**
 * Convert BN to number with proper scaling for SOL (9 decimals)
 */
export const fromBN = (bn: BN, decimals: number = 9): number => {
  return bn.toNumber() / Math.pow(10, decimals);
};

/**
 * Get user account info using Anchor
 */
export const getUserAccountInfo = async (
  connection: Connection,
  userPublicKey: PublicKey
) => {
  try {
    const program = getReadOnlyDexProgram(connection, userPublicKey);
    const [clientPDA] = deriveDexPDAs.client(userPublicKey);

    const userAccount = await program.account.userInfor.fetch(clientPDA);
    return {
      pda: clientPDA,
      account: userAccount,
    };
  } catch (error) {
    console.error("Error fetching user account info:", error);
    return null;
  }
};

/**
 * Get all vault balances
 */
export const getVaultBalances = async (connection: Connection) => {
  try {
    const [solVault] = deriveDexPDAs.solVault();
    const [sfcVault] = deriveDexPDAs.sfcVault();

    const solBalance = await connection.getBalance(solVault);
    const sfcAccountInfo = await connection.getAccountInfo(sfcVault);

    return {
      solVault,
      sfcVault,
      solBalance,
      sfcAccountInfo,
    };
  } catch (error) {
    console.error("Error fetching vault balances:", error);
    return null;
  }
};
