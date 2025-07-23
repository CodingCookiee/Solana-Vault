import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  Keypair,
  SystemProgram,
  GetProgramAccountsFilter,
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
  createApproveInstruction,
  createRevokeInstruction,
  getAccount,
  getMint,
  AccountLayout,
  MintLayout,
} from "@solana/spl-token";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import TransactionResult from "@/services/spl-tokens";
import { TokenAllowance } from "./spl.types";
import {
  CreateTokenForm,
  TokenInfo,
  TransactionResult,
  MintInfo,
  CreatedToken,
  TokenMetadata,
  TokenAllowance,
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

    // Save created token to local storage
    const createdToken: CreatedToken = {
      mintAddress: mintKeypair.publicKey.toBase58(),
      name: form.tokenName,
      symbol: form.symbol,
      decimals: form.decimals,
      totalSupply: form.amount,
      mintAuthority: publicKey!.toBase58(),
      freezeAuthority: publicKey!.toBase58(),
      createdAt: new Date(),
      metadata: {
        name: form.tokenName,
        symbol: form.symbol,
        uri: form.metadata,
      },
      userBalance: form.amount,
      tokenAccount: tokenATA.toBase58(),
    };

    saveCreatedTokenToStorage(createdToken);

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

// Get token metadata from Metaplex
export const getTokenMetadata = async (
  connection: Connection,
  mintAddress: string
): Promise<TokenMetadata | null> => {
  try {
    const mint = new PublicKey(mintAddress);

    // Find metadata PDA
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    // Get metadata account
    const metadataAccount = await connection.getAccountInfo(metadataPDA);

    if (!metadataAccount) {
      return null;
    }

    // Parse metadata (simplified parsing)
    const data = metadataAccount.data;

    // Skip the first 1 byte (key) + 32 bytes (update authority) + 32 bytes (mint)
    let offset = 1 + 32 + 32;

    // Read name length and name
    const nameLength = data.readUInt32LE(offset);
    offset += 4;
    const name = data
      .slice(offset, offset + nameLength)
      .toString("utf8")
      .replace(/\0/g, "");
    offset += nameLength;

    // Read symbol length and symbol
    const symbolLength = data.readUInt32LE(offset);
    offset += 4;
    const symbol = data
      .slice(offset, offset + symbolLength)
      .toString("utf8")
      .replace(/\0/g, "");
    offset += symbolLength;

    // Read URI length and URI
    const uriLength = data.readUInt32LE(offset);
    offset += 4;
    const uri = data
      .slice(offset, offset + uriLength)
      .toString("utf8")
      .replace(/\0/g, "");

    return {
      name: name.trim(),
      symbol: symbol.trim(),
      uri: uri.trim(),
    };
  } catch (error) {
    console.error("Error getting token metadata:", error);
    return null;
  }
};

// Update the getCreatedTokens function to handle the RPC limitation
export const getCreatedTokens = async (
  connection: Connection,
  publicKey: PublicKey | null
): Promise<CreatedToken[]> => {
  try {
    ensureWalletConnected(publicKey);

    console.log("Fetching created tokens for:", publicKey!.toBase58());

    // Since getProgramAccounts is not available for Token Program on many RPC endpoints,
    // we'll use a different approach - get transaction history and parse token creation transactions
    // For now, we'll return an empty array and suggest using a different approach

    console.log(
      "getProgramAccounts not available for Token Program on this RPC endpoint"
    );
    console.log(
      "Consider using a custom RPC endpoint or storing created tokens locally"
    );

    return [];
  } catch (error) {
    console.error("Error getting created tokens:", error);

    // If the error is about RPC method unavailability, return empty array
    if (
      error instanceof Error &&
      error.message.includes("excluded from account secondary indexes")
    ) {
      console.log(
        "RPC endpoint doesn't support getProgramAccounts for Token Program"
      );
      return [];
    }

    return [];
  }
};

// Alternative approach: Get created tokens from local storage
export const getCreatedTokensFromStorage = (): CreatedToken[] => {
  try {
    const stored = localStorage.getItem("created-tokens");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading created tokens from storage:", error);
    return [];
  }
};

// Save created token to local storage
export const saveCreatedTokenToStorage = (token: CreatedToken): void => {
  try {
    const existing = getCreatedTokensFromStorage();
    const updated = [
      ...existing.filter((t) => t.mintAddress !== token.mintAddress),
      token,
    ];
    localStorage.setItem("created-tokens", JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving created token to storage:", error);
  }
};

// Remove created token from local storage
export const removeCreatedTokenFromStorage = (mintAddress: string): void => {
  try {
    const existing = getCreatedTokensFromStorage();
    const updated = existing.filter((t) => t.mintAddress !== mintAddress);
    localStorage.setItem("created-tokens", JSON.stringify(updated));
  } catch (error) {
    console.error("Error removing created token from storage:", error);
  }
};

// Close token account (this removes the token from your wallet)
export const closeTokenAccount = async (
  connection: Connection,
  publicKey: PublicKey | null,
  sendTransaction: (
    transaction: Transaction,
    connection: Connection
  ) => Promise<string>,
  mintAddress: string
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(publicKey);

    if (!mintAddress) {
      throw new Error("Mint address is required");
    }

    const mint = new PublicKey(mintAddress);
    const tokenAccount = await getAssociatedTokenAddress(mint, publicKey!);

    // Check if account exists and get balance
    try {
      const accountInfo = await getAccount(connection, tokenAccount);

      // If there are tokens in the account, we need to burn them first or transfer them out
      if (Number(accountInfo.amount) > 0) {
        throw new Error(
          `Cannot close account with ${Number(
            accountInfo.amount
          )} tokens. Transfer or burn tokens first.`
        );
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("could not find account")
      ) {
        throw new Error("Token account does not exist");
      }
      throw error;
    }

    // Import the close account instruction
    const { createCloseAccountInstruction } = await import("@solana/spl-token");

    const transaction = new Transaction().add(
      createCloseAccountInstruction(
        tokenAccount, // Account to close
        publicKey!, // Destination for remaining SOL
        publicKey! // Owner
      )
    );

    const signature = await sendTransaction(transaction, connection);

    return {
      signature,
      success: true,
    };
  } catch (error) {
    console.error("Error closing token account:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Get all tokens the user owns (has balance > 0)
export const getOwnedTokens = async (
  connection: Connection,
  publicKey: PublicKey | null
): Promise<CreatedToken[]> => {
  try {
    ensureWalletConnected(publicKey);

    console.log("Fetching owned tokens for:", publicKey!.toBase58());

    // Get all token accounts owned by the user
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey!,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    console.log(`Found ${tokenAccounts.value.length} token accounts`);

    const ownedTokens: CreatedToken[] = [];

    for (const { pubkey: tokenAccountPubkey, account } of tokenAccounts.value) {
      try {
        const parsedInfo = account.data.parsed.info;
        const mintAddress = parsedInfo.mint;
        const balance = parseFloat(parsedInfo.tokenAmount.uiAmount || "0");

        // Skip if balance is 0
        if (balance === 0) {
          continue;
        }

        const mint = new PublicKey(mintAddress);

        // Get mint info
        const mintInfo = await getMint(connection, mint);

        // Get metadata
        const metadata = await getTokenMetadata(connection, mintAddress);

        const ownedToken: CreatedToken = {
          mintAddress,
          name: metadata?.name || "Unknown Token",
          symbol: metadata?.symbol || "UNK",
          decimals: mintInfo.decimals,
          totalSupply:
            Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals),
          mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
          freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
          metadata,
          userBalance: balance,
          tokenAccount: tokenAccountPubkey.toBase58(),
        };

        ownedTokens.push(ownedToken);
      } catch (error) {
        console.error(
          `Error processing token account ${tokenAccountPubkey.toBase58()}:`,
          error
        );
        continue;
      }
    }

    console.log(`Successfully processed ${ownedTokens.length} owned tokens`);
    return ownedTokens.sort(
      (a, b) => (b.userBalance || 0) - (a.userBalance || 0)
    ); // Sort by balance descending
  } catch (error) {
    console.error("Error getting owned tokens:", error);
    return [];
  }
};

// Approve tokens for delegation
export const approveTokens = async (
  connection: Connection,
  publicKey: PublicKey | null,
  sendTransaction: (
    transaction: Transaction,
    connection: Connection
  ) => Promise<string>,
  mintAddress: string,
  delegateAddress: string,
  amount: number
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(publicKey);

    if (!mintAddress || !delegateAddress) {
      throw new Error("Mint address and delegate address are required");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const mint = new PublicKey(mintAddress);
    const delegate = new PublicKey(delegateAddress);

    // Get the token account for the owner
    const ownerTokenAccount = await getAssociatedTokenAddress(mint, publicKey!);

    // Get mint info to determine decimals
    const mintInfo = await getMint(connection, mint);
    const amountWithDecimals = amount * Math.pow(10, mintInfo.decimals);

    // Create approve instruction
    const transaction = new Transaction().add(
      createApproveInstruction(
        ownerTokenAccount, // Source account (owner's token account)
        delegate, // Delegate
        publicKey!, // Owner
        amountWithDecimals // Amount to approve
      )
    );

    const signature = await sendTransaction(transaction, connection);

    return {
      signature,
      success: true,
    };
  } catch (error) {
    console.error("Error approving tokens:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Revoke token approval
export const revokeTokenApproval = async (
  connection: Connection,
  publicKey: PublicKey | null,
  sendTransaction: (
    transaction: Transaction,
    connection: Connection
  ) => Promise<string>,
  mintAddress: string
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(publicKey);

    if (!mintAddress) {
      throw new Error("Mint address is required");
    }

    const mint = new PublicKey(mintAddress);

    // Get the token account for the owner
    const ownerTokenAccount = await getAssociatedTokenAddress(mint, publicKey!);

    // Create revoke instruction
    const transaction = new Transaction().add(
      createRevokeInstruction(
        ownerTokenAccount, // Source account (owner's token account)
        publicKey! // Owner
      )
    );

    const signature = await sendTransaction(transaction, connection);

    return {
      signature,
      success: true,
    };
  } catch (error) {
    console.error("Error revoking token approval:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Get token allowance information
export const getTokenAllowance = async (
  connection: Connection,
  publicKey: PublicKey | null,
  mintAddress: string
): Promise<TokenAllowance | null> => {
  try {
    ensureWalletConnected(publicKey);

    if (!mintAddress) {
      return null;
    }

    const mint = new PublicKey(mintAddress);
    const ownerTokenAccount = await getAssociatedTokenAddress(mint, publicKey!);

    // Get account info
    const accountInfo = await getAccount(connection, ownerTokenAccount);
    
    if (!accountInfo.delegate) {
      return null; // No delegation
    }

    // Get mint info for decimals
    const mintInfo = await getMint(connection, mint);

    return {
      owner: publicKey!.toBase58(),
      delegate: accountInfo.delegate.toBase58(),
      amount: Number(accountInfo.delegatedAmount) / Math.pow(10, mintInfo.decimals),
      mintAddress,
    };
  } catch (error) {
    console.error("Error getting token allowance:", error);
    return null;
  }
};

// Transfer tokens using delegation (transferFrom equivalent)
export const transferTokensFrom = async (
  connection: Connection,
  publicKey: PublicKey | null,
  sendTransaction: (
    transaction: Transaction,
    connection: Connection
  ) => Promise<string>,
  mintAddress: string,
  ownerAddress: string,
  recipientAddress: string,
  amount: number
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(publicKey);

    if (!mintAddress || !ownerAddress || !recipientAddress) {
      throw new Error("Mint address, owner address, and recipient address are required");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const mint = new PublicKey(mintAddress);
    const owner = new PublicKey(ownerAddress);
    const recipient = new PublicKey(recipientAddress);

    // Get source and destination token accounts
    const sourceATA = await getAssociatedTokenAddress(mint, owner);
    const destinationATA = await getAssociatedTokenAddress(mint, recipient);

    // Get mint info to determine decimals
    const mintInfo = await getMint(connection, mint);
    const amountWithDecimals = amount * Math.pow(10, mintInfo.decimals);

    // Check if destination token account exists
    const destinationAccountInfo = await connection.getAccountInfo(destinationATA);

    const transaction = new Transaction();

    // If destination account doesn't exist, create it first
    if (!destinationAccountInfo) {
      console.log("Creating destination token account:", destinationATA.toBase58());
      transaction.add(
        createAssociatedTokenAccountInstruction(
          publicKey!, // Payer (delegate)
          destinationATA, // Associated token account
          recipient, // Owner
          mint // Mint
        )
      );
    }

    // Add transfer instruction with delegate authority
    transaction.add(
      createTransferInstruction(
        sourceATA, // Source
        destinationATA, // Destination
        publicKey!, // Authority (delegate)
        amountWithDecimals, // Amount
        [], // Multi-signers (none in this case)
        TOKEN_PROGRAM_ID
      )
    );

    const signature = await sendTransaction(transaction, connection);

    return {
      signature,
      success: true,
    };
  } catch (error) {
    console.error("Error transferring tokens from:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};