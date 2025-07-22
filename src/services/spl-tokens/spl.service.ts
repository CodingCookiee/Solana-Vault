import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  Keypair,
  SystemProgram,
} from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createTransferInstruction,
  createBurnInstruction,
  getAccount,
  getMint,
} from "@solana/spl-token";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import {
  CreateTokenForm,
  TokenInfo,
  TransactionResult,
  MintInfo,
} from "./spl.types";

// Hardcoded Metaplex Token Metadata Program ID
const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// Helper function to ensure wallet is connected
const ensureWalletConnected = (publicKey: PublicKey | null) => {
  if (!publicKey) {
    throw new Error("Wallet not connected");
  }
};

// Get SOL balance
export const getSOLBalance = async (
  connection: Connection,
  publicKey: PublicKey | null
): Promise<number> => {
  ensureWalletConnected(publicKey);
  try {
    const balance = await connection.getBalance(publicKey!);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error getting SOL balance:", error);
    throw new Error("Failed to get SOL balance");
  }
};

// Create a new SPL token with metadata (following the working example)
export const createToken = async (
  connection: Connection,
  publicKey: PublicKey | null,
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: any
  ) => Promise<string>,
  form: CreateTokenForm
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(publicKey);

    if (!form.tokenName || !form.symbol) {
      throw new Error("Token name and symbol are required");
    }

    console.log("Creating token with form:", form);

    // Get minimum lamports for rent exemption
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // Generate a new keypair for the mint
    const mintKeypair = Keypair.generate();
    console.log("Generated mint keypair:", mintKeypair.publicKey.toBase58());

    // Get associated token address
    const tokenATA = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      publicKey!
    );
    console.log("Token ATA:", tokenATA.toBase58());

    // Create metadata PDA
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    console.log("Metadata PDA:", metadataPDA.toBase58());

    // Create metadata instruction
    const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint: mintKeypair.publicKey,
        mintAuthority: publicKey!,
        payer: publicKey!,
        updateAuthority: publicKey!,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: form.tokenName,
            symbol: form.symbol,
            uri: form.metadata,
            creators: null,
            sellerFeeBasisPoints: 0,
            uses: null,
            collection: null,
          },
          isMutable: true,
          collectionDetails: null,
        },
      }
    );

    // Create the complete transaction with all instructions
    const createNewTokenTransaction = new Transaction().add(
      // Create mint account
      SystemProgram.createAccount({
        fromPubkey: publicKey!,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      // Initialize mint
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        form.decimals,
        publicKey!,
        publicKey!,
        TOKEN_PROGRAM_ID
      ),
      // Create associated token account
      createAssociatedTokenAccountInstruction(
        publicKey!,
        tokenATA,
        publicKey!,
        mintKeypair.publicKey
      ),
      // Mint tokens
      createMintToInstruction(
        mintKeypair.publicKey,
        tokenATA,
        publicKey!,
        form.amount * Math.pow(10, form.decimals)
      ),
      // Add metadata
      createMetadataInstruction
    );

    console.log("Sending transaction...");
    const signature = await sendTransaction(
      createNewTokenTransaction,
      connection,
      {
        signers: [mintKeypair],
      }
    );

    console.log("Transaction signature:", signature);

    return {
      signature: mintKeypair.publicKey.toBase58(), // Return mint address
      success: true,
    };
  } catch (error) {
    console.error("Error creating token:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Mint additional tokens
export const mintTokens = async (
  connection: Connection,
  publicKey: PublicKey | null,
  sendTransaction: (
    transaction: Transaction,
    connection: Connection
  ) => Promise<string>,
  mintAddress: string,
  amount: number
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(publicKey);

    if (!mintAddress) {
      throw new Error("Mint address is required");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const mint = new PublicKey(mintAddress);
    const tokenATA = await getAssociatedTokenAddress(mint, publicKey!);

    // Get mint info to determine decimals
    const mintInfo = await getMint(connection, mint);
    const amountWithDecimals = amount * Math.pow(10, mintInfo.decimals);

    const transaction = new Transaction().add(
      createMintToInstruction(mint, tokenATA, publicKey!, amountWithDecimals)
    );

    const signature = await sendTransaction(transaction, connection);

    return {
      signature,
      success: true,
    };
  } catch (error) {
    console.error("Error minting tokens:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Transfer tokens
export const transferTokens = async (
  connection: Connection,
  publicKey: PublicKey | null,
  sendTransaction: (
    transaction: Transaction,
    connection: Connection
  ) => Promise<string>,
  mintAddress: string,
  recipientAddress: string,
  amount: number
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(publicKey);

    if (!mintAddress || !recipientAddress) {
      throw new Error("Mint address and recipient address are required");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const mint = new PublicKey(mintAddress);
    const recipient = new PublicKey(recipientAddress);

    // Get source and destination token accounts
    const sourceATA = await getAssociatedTokenAddress(mint, publicKey!);
    const destinationATA = await getAssociatedTokenAddress(mint, recipient);

    // Get mint info to determine decimals
    const mintInfo = await getMint(connection, mint);
    const amountWithDecimals = amount * Math.pow(10, mintInfo.decimals);

    // Check if destination token account exists
    const destinationAccountInfo = await connection.getAccountInfo(
      destinationATA
    );

    const transaction = new Transaction();

    // If destination account doesn't exist, create it first
    if (!destinationAccountInfo) {
      console.log(
        "Creating destination token account:",
        destinationATA.toBase58()
      );
      transaction.add(
        createAssociatedTokenAccountInstruction(
          publicKey!, // Payer
          destinationATA, // Associated token account
          recipient, // Owner
          mint // Mint
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        sourceATA,
        destinationATA,
        publicKey!,
        amountWithDecimals
      )
    );

    const signature = await sendTransaction(transaction, connection);

    return {
      signature,
      success: true,
    };
  } catch (error) {
    console.error("Error transferring tokens:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Burn tokens
export const burnTokens = async (
  connection: Connection,
  publicKey: PublicKey | null,
  sendTransaction: (
    transaction: Transaction,
    connection: Connection
  ) => Promise<string>,
  mintAddress: string,
  amount: number
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(publicKey);

    if (!mintAddress) {
      throw new Error("Mint address is required");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const mint = new PublicKey(mintAddress);
    const tokenATA = await getAssociatedTokenAddress(mint, publicKey!);

    // Get mint info to determine decimals
    const mintInfo = await getMint(connection, mint);
    const amountWithDecimals = amount * Math.pow(10, mintInfo.decimals);

    const transaction = new Transaction().add(
      createBurnInstruction(tokenATA, mint, publicKey!, amountWithDecimals)
    );

    const signature = await sendTransaction(transaction, connection);

    return {
      signature,
      success: true,
    };
  } catch (error) {
    console.error("Error burning tokens:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Get token account info
export const getTokenAccountInfo = async (
  connection: Connection,
  publicKey: PublicKey | null,
  mintAddress: string
): Promise<TokenInfo | null> => {
  try {
    ensureWalletConnected(publicKey);

    if (!mintAddress) {
      return null;
    }

    const mint = new PublicKey(mintAddress);
    const tokenATA = await getAssociatedTokenAddress(mint, publicKey!);

    const accountInfo = await getAccount(connection, tokenATA);
    const mintInfo = await getMint(connection, mint);

    return {
      mint: mintAddress,
      account: tokenATA.toBase58(),
      balance: Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals),
      decimals: mintInfo.decimals,
    };
  } catch (error) {
    console.error("Error getting token account info:", error);
    return null;
  }
};

// Get mint info
export const getMintInfo = async (
  connection: Connection,
  mintAddress: string
): Promise<MintInfo | null> => {
  try {
    if (!mintAddress) {
      return null;
    }

    const mint = new PublicKey(mintAddress);
    const mintInfo = await getMint(connection, mint);

    return {
      address: mintAddress,
      decimals: mintInfo.decimals,
      supply: Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals),
      mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
      freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
    };
  } catch (error) {
    console.error("Error getting mint info:", error);
    return null;
  }
};
