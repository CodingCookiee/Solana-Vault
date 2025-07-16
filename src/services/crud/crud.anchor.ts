import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import {
  PROGRAM_ID,
  CRUDAPP_IDL,
  Crudapp,
  UserCrudEntries,
} from "./crud.types";

/**
 * Get Anchor program instance for CRUD operations
 */
export const getAnchorProgram = (
  connection: Connection,
  wallet: AnchorWallet
): Program<Crudapp> => {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
    commitment: "confirmed",
  });

  return new Program(
    CRUDAPP_IDL as any,
    PROGRAM_ID,
    provider
  ) as Program<Crudapp>;
};

/**
 * Derive the user's entries PDA
 * This is the single PDA that holds all entries for a user
 */
export const deriveUserEntriesPDA = async (
  owner: PublicKey
): Promise<[PublicKey, number]> => {
  return await PublicKey.findProgramAddress(
    [Buffer.from("user_entries"), owner.toBuffer()],
    PROGRAM_ID
  );
};

/**
 * Check if user's entries account is initialized
 */
export const isUserEntriesInitialized = async (
  connection: Connection,
  owner: PublicKey
): Promise<boolean> => {
  try {
    const [userEntriesPDA] = await deriveUserEntriesPDA(owner);
    const accountInfo = await connection.getAccountInfo(userEntriesPDA);
    return accountInfo !== null;
  } catch (error) {
    console.error("Error checking if user entries initialized:", error);
    return false;
  }
};

/**
 * Get user's entries account data
 */
export const getUserEntriesAccount = async (
  connection: Connection,
  wallet: AnchorWallet,
  owner: PublicKey
): Promise<UserCrudEntries | null> => {
  try {
    const program = getAnchorProgram(connection, wallet);
    const [userEntriesPDA] = await deriveUserEntriesPDA(owner);

    const accountData = await program.account.userCrudEntries.fetch(
      userEntriesPDA
    );
    return accountData as UserCrudEntries;
  } catch (error) {
    console.error("Error fetching user entries account:", error);
    return null;
  }
};

/**
 * Create a dummy wallet for read-only operations
 */
export const createDummyWallet = (): AnchorWallet => {
  const keypair = web3.Keypair.generate();
  return {
    publicKey: keypair.publicKey,
    signTransaction: async (tx) => {
      throw new Error("Dummy wallet cannot sign transactions");
    },
    signAllTransactions: async (txs) => {
      throw new Error("Dummy wallet cannot sign transactions");
    },
  };
};

/**
 * Get program instance for read-only operations
 */
export const getReadOnlyProgram = (
  connection: Connection
): Program<Crudapp> => {
  const dummyWallet = createDummyWallet();
  return getAnchorProgram(connection, dummyWallet);
};
