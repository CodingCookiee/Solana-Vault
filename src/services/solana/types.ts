import { PublicKey, Transaction } from '@solana/web3.js';


export const SolanaServiceResult {
    signature: string;
    success: boolean;
    error?: string;
    data?: any;
}


export interface AccountInfo {
owner: string;
lamports: number;
dataLength: number;
executable: boolean;
rentEpoch: number;
data?:string;
explorerUrl: string;
}


export interface TransactionInfo {
    signature: string;
    blockTime: number;
    confirmationStatus: string | null;
    error?: any;
    explorerUrl: string;

}