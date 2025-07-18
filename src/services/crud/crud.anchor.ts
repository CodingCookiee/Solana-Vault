import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PROGRAM_ID, CRUDAPP_IDL, Crudapp } from "./crud.types";

/**
 * Get Anchor Program instance
 */
export const getAnchorProgram = (
  connection: Connection,
  wallet: AnchorWallet
): Program<Crudapp> => {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });

  return new Program(CRUDAPP_IDL as any, PROGRAM_ID, provider);
};

/**
 * Derive PDA for CRUD entry
 */
export const deriveCrudEntryPDA = async (
  title: string,
  owner: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  return await web3.PublicKey.findProgramAddress(
    [Buffer.from(title), owner.toBuffer()],
    PROGRAM_ID
  );
};

/**
 * Create a read-only program instance for fetching data
 */
export const getReadOnlyProgram = (
  connection: Connection,
  publicKey: web3.PublicKey
): Program<Crudapp> => {
  // Create a dummy wallet for read operations
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
    preflightCommitment: "confirmed",
  });

  return new Program(CRUDAPP_IDL as any, PROGRAM_ID, provider);
};

/**
 * Check if a CRUD entry exists
 */
export const checkCrudEntryExists = async (
  connection: Connection,
  owner: web3.PublicKey,
  title: string
): Promise<boolean> => {
  try {
    const program = getReadOnlyProgram(connection, owner);
    const [crudEntryPda] = await deriveCrudEntryPDA(title, owner);
    
    await program.account.crudEntryState.fetch(crudEntryPda);
    return true;
  } catch (error) {
    return false;
  }
};
