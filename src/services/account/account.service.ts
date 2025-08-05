import { Connection, PublicKey } from "@solana/web3.js";
import { SOLANA_EXPLORER_BASE_URL, CLUSTER } from "../solana/constants";
import { AccountInfo, TransactionInfo } from "../solana/types";
import { AccountExistsResult, ProgramAccountInfo } from "./account.types";

/**
 * Read account data from any Solana account
 */
export const readAccountData = async (
  connection: Connection,
  accountAddress: PublicKey
): Promise<AccountInfo> => {
  try {
    const accountInfo = await connection.getAccountInfo(accountAddress);

    if (!accountInfo) {
      throw new Error("Account not found");
    }

    return {
      owner: accountInfo.owner.toBase58(),
      lamports: accountInfo.lamports,
      dataLength: accountInfo.data.length,
      executable: accountInfo.executable,
      rentEpoch: accountInfo.rentEpoch,
      data: accountInfo.data.toString("hex"),
      explorerUrl: `${SOLANA_EXPLORER_BASE_URL}/address/${accountAddress.toBase58()}?cluster=${CLUSTER}`,
    };
  } catch (error) {
    console.error("Error reading account data:", error);
    throw error;
  }
};

/**
 * Check if an account exists
 */
export const checkAccountExists = async (
  connection: Connection,
  accountAddress: PublicKey
): Promise<AccountExistsResult> => {
  try {
    const accountInfo = await connection.getAccountInfo(accountAddress);

    if (!accountInfo) {
      return { exists: false };
    }

    return {
      exists: true,
      info: {
        owner: accountInfo.owner.toBase58(),
        lamports: accountInfo.lamports,
        dataLength: accountInfo.data.length,
        executable: accountInfo.executable,
        rentEpoch: accountInfo.rentEpoch,
        explorerUrl: `${SOLANA_EXPLORER_BASE_URL}/address/${accountAddress.toBase58()}?cluster=${CLUSTER}`,
      },
    };
  } catch (error) {
    console.error("Error checking account:", error);
    return { exists: false };
  }
};

/**
 * Get recent transactions for an address
 */
export const getAccountTransactions = async (
  connection: Connection,
  accountAddress: PublicKey,
  limit: number = 10
): Promise<TransactionInfo[]> => {
  try {
    const signatures = await connection.getSignaturesForAddress(
      accountAddress,
      { limit }
    );

    return signatures.map((sig) => ({
      signature: sig.signature,
      slot: sig.slot,
      blockTime: sig.blockTime ?? null,
      confirmationStatus: sig.confirmationStatus ?? null,
      err: sig.err ?? null,
      explorerUrl: `${SOLANA_EXPLORER_BASE_URL}/tx/${sig.signature}?cluster=${CLUSTER}`,
    }));
  } catch (error) {
    console.error("Error getting transactions:", error);
    throw error;
  }
};

/**
 * Get program accounts owned by a specific program
 */
export const getProgramAccounts = async (
  connection: Connection,
  programId: PublicKey
): Promise<ProgramAccountInfo[]> => {
  try {
    const accounts = await connection.getProgramAccounts(programId, {
      commitment: "processed",
    });

    return accounts.map((account) => ({
      pubkey: account.pubkey.toBase58(),
      owner: account.account.owner.toBase58(),
      lamports: account.account.lamports,
      dataLength: account.account.data.length,
      executable: account.account.executable,
      explorerUrl: `${SOLANA_EXPLORER_BASE_URL}/address/${account.pubkey.toBase58()}?cluster=${CLUSTER}`,
    }));
  } catch (error) {
    console.error("Error getting program accounts:", error);
    throw error;
  }
};

/**
 * Validate Solana public key
 */
export const isValidPublicKey = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get multiple accounts data in a single call
 */
export const getMultipleAccountsData = async (
  connection: Connection,
  accountAddresses: PublicKey[]
): Promise<(AccountInfo | null)[]> => {
  try {
    const accountInfos = await connection.getMultipleAccountsInfo(
      accountAddresses
    );

    return accountInfos.map((accountInfo, index) => {
      if (!accountInfo) return null;

      return {
        owner: accountInfo.owner.toBase58(),
        lamports: accountInfo.lamports,
        dataLength: accountInfo.data.length,
        executable: accountInfo.executable,
        rentEpoch: accountInfo.rentEpoch,
        data: accountInfo.data.toString("hex"),
        explorerUrl: `${SOLANA_EXPLORER_BASE_URL}/address/${accountAddresses[
          index
        ].toBase58()}?cluster=${CLUSTER}`,
      };
    });
  } catch (error) {
    console.error("Error getting multiple accounts data:", error);
    throw error;
  }
};

/**
 * Get account size and rent exemption info
 */
export const getAccountRentInfo = async (
  connection: Connection,
  accountAddress: PublicKey
): Promise<{
  balance: number;
  rentExemptMinimum: number;
  isRentExempt: boolean;
  dataSize: number;
}> => {
  try {
    const accountInfo = await connection.getAccountInfo(accountAddress);

    if (!accountInfo) {
      throw new Error("Account not found");
    }

    const rentExemptMinimum =
      await connection.getMinimumBalanceForRentExemption(
        accountInfo.data.length
      );

    return {
      balance: accountInfo.lamports,
      rentExemptMinimum,
      isRentExempt: accountInfo.lamports >= rentExemptMinimum,
      dataSize: accountInfo.data.length,
    };
  } catch (error) {
    console.error("Error getting account rent info:", error);
    throw error;
  }
};