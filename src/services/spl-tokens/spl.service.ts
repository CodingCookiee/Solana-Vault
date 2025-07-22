import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  Keypair,
  SystemProgram,
} from "@solana/web3.js";
import {
  createMint,
  createAssociatedTokenAccount,
  getAssociatedTokenAddress,
  mintTo,
  transfer,
  burn,
  approve,
  revoke,
  getAccount,
  getMint,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createTransferInstruction,
  createBurnInstruction,
  createApproveInstruction,
  createRevokeInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  TokenInfo,
  TransactionResult,
  MintInfo,
  SolanaWallet,
  CreateTokenOptions,
  TokenMetadata,
} from "./spl.types";

// For Metaplex Token Metadata
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

// Helper function to ensure wallet is connected
export const ensureWalletConnected = (publicKey: PublicKey | null) => {
  if (!publicKey) {
    throw new Error("Wallet not connected");
  }
};

// Helper function to safely convert PublicKey to string
export const safeToBase58 = (publicKey: PublicKey | null): string => {
  if (!publicKey) return "";
  try {
    return publicKey.toBase58();
  } catch (error) {
    console.error("Error converting PublicKey to base58:", error);
    return "";
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

// Helper function to derive metadata PDA
const findMetadataPda = (mint: PublicKey): PublicKey => {
  // Hardcoded Metaplex Token Metadata Program ID for when the import fails
  const metaplexProgramId = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), metaplexProgramId.toBuffer(), mint.toBuffer()],
    metaplexProgramId
  );
  return pda;
};

// Convert file to data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Create metadata JSON for token
const createTokenMetadataJSON = async (
  metadata: TokenMetadata
): Promise<string> => {
  const metadataJson: Record<string, any> = {
    name: metadata.name,
    symbol: metadata.symbol,
    description: metadata.description || `A ${metadata.name} token`,
  };

  // Handle image (could be URL, File, or null)
  if (metadata.image) {
    if (typeof metadata.image === "string") {
      metadataJson.image = metadata.image;
    } else if (metadata.image instanceof File) {
      // Convert file to data URL
      metadataJson.image = await fileToDataUrl(metadata.image);
    }
  }

  return JSON.stringify(metadataJson);
};

// Create a new SPL token with metadata
export const createToken = async (
  connection: Connection,
  wallet: SolanaWallet,
  options: CreateTokenOptions = {}
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(wallet.publicKey);

    if (!wallet.sendTransaction) {
      throw new Error("Wallet does not support sending transactions");
    }

    const decimals = options.decimals ?? 9;

    // Generate a new keypair for the mint
    const mintKeypair = Keypair.generate();

    // Calculate minimum lamports needed for mint account
    const mintLamports = await connection.getMinimumBalanceForRentExemption(
      MINT_SIZE
    );

    // Create transaction
    const transaction = new Transaction();

    // Add instruction to create mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey!,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: mintLamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      // Initialize mint
      createInitializeMintInstruction(
        mintKeypair.publicKey, // Mint account
        decimals, // Decimals
        wallet.publicKey!, // Mint authority
        wallet.publicKey! // Freeze authority (optional)
      )
    );

    // If metadata is provided, add metadata instruction
    if (options.metadata) {
      const metadata = options.metadata;

      try {
        // Create metadata PDA
        const metadataPDA = findMetadataPda(mintKeypair.publicKey);

        // Generate URI with inline data if no URI is provided
        let uri = metadata.uri || "";
        if (!uri && metadata.image) {
          // Create a simple JSON metadata with the image
          const metadataJSON = await createTokenMetadataJSON(metadata);
          uri = `data:application/json,${encodeURIComponent(metadataJSON)}`;
        }

        // Create metadata instruction
        const metadataInstruction = createCreateMetadataAccountV3Instruction(
          {
            metadata: metadataPDA,
            mint: mintKeypair.publicKey,
            mintAuthority: wallet.publicKey!,
            payer: wallet.publicKey!,
            updateAuthority: wallet.publicKey!,
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                name: metadata.name,
                symbol: metadata.symbol,
                uri: uri,
                sellerFeeBasisPoints: metadata.sellerFeeBasisPoints || 0,
                creators: null,
                collection: null,
                uses: null,
              },
              isMutable: true,
              collectionDetails: null,
            },
          }
        );

        transaction.add(metadataInstruction);
      } catch (error) {
        console.error("Error creating metadata:", error);
        // Continue without metadata if there's an error
      }
    }

    // Create an associated token account for the user
    const associatedTokenAddress = getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      wallet.publicKey!
    );

    transaction.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey!, // Payer
        associatedTokenAddress, // Associated token account
        wallet.publicKey!, // Owner
        mintKeypair.publicKey // Mint
      )
    );

    // Send transaction with the mint keypair as signer
    const signature = await wallet.sendTransaction(transaction, connection, {
      signers: [mintKeypair],
    });

    // Confirm transaction
    await connection.confirmTransaction(signature, "confirmed");

    return {
      signature: mintKeypair.publicKey.toBase58(), // Return mint address, not transaction signature
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

// Create associated token account
export const createTokenAccount = async (
  connection: Connection,
  wallet: SolanaWallet,
  mintAddress: string
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(wallet.publicKey);

    if (!mintAddress || mintAddress.length === 0) {
      throw new Error("Invalid mint address");
    }

    if (!wallet.sendTransaction) {
      throw new Error("Wallet does not support sending transactions");
    }

    const mint = new PublicKey(mintAddress);
    const associatedTokenAddress = getAssociatedTokenAddressSync(
      mint,
      wallet.publicKey!
    );

    // Check if account already exists
    const accountInfo = await connection.getAccountInfo(associatedTokenAddress);
    if (accountInfo) {
      return {
        signature: associatedTokenAddress.toBase58(),
        success: true,
      };
    }

    // Create transaction
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey!, // Payer
        associatedTokenAddress, // Associated token account
        wallet.publicKey!, // Owner
        mint // Mint
      )
    );

    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, "confirmed");

    return {
      signature: associatedTokenAddress.toBase58(),
      success: true,
    };
  } catch (error) {
    console.error("Error creating token account:", error);
    return {
      signature: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Get associated token address
export const getAssociatedTokenAddressForWallet = async (
  mintAddress: string,
  publicKey: PublicKey | null
): Promise<string> => {
  try {
    ensureWalletConnected(publicKey);

    if (!mintAddress || mintAddress.length === 0) {
      throw new Error("Invalid mint address");
    }

    const mint = new PublicKey(mintAddress);
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mint,
      publicKey!
    );
    return safeToBase58(associatedTokenAddress);
  } catch (error) {
    console.error("Error getting associated token address:", error);
    throw error;
  }
};

// Mint tokens to an account
export const mintTokens = async (
  connection: Connection,
  wallet: SolanaWallet,
  mintAddress: string,
  amount: number,
  destinationAddress?: string
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(wallet.publicKey);

    if (!mintAddress || mintAddress.length === 0) {
      throw new Error("Invalid mint address");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const mint = new PublicKey(mintAddress);

    // If no destination provided, use wallet's associated token account
    let destination: PublicKey;
    if (destinationAddress) {
      destination = new PublicKey(destinationAddress);
    } else {
      destination = await getAssociatedTokenAddress(mint, wallet.publicKey!);
    }

    if (!wallet.sendTransaction) {
      throw new Error("Wallet does not support sending transactions");
    }

    // Create transaction with mint instruction
    const transaction = new Transaction().add(
      createMintToInstruction(
        mint, // Mint
        destination, // Destination
        wallet.publicKey!, // Authority
        amount // Amount (in smallest unit)
      )
    );

    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, "confirmed");

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
  wallet: SolanaWallet,
  mintAddress: string,
  recipientAddress: string,
  amount: number
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(wallet.publicKey);

    if (!mintAddress || mintAddress.length === 0) {
      throw new Error("Invalid mint address");
    }

    if (!recipientAddress || recipientAddress.length === 0) {
      throw new Error("Invalid recipient address");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const mint = new PublicKey(mintAddress);
    const recipient = new PublicKey(recipientAddress);

    // Get source token account
    const sourceAccount = await getAssociatedTokenAddress(
      mint,
      wallet.publicKey!
    );

    // Get destination token account
    const destinationAccount = await getAssociatedTokenAddress(mint, recipient);

    if (!wallet.sendTransaction) {
      throw new Error("Wallet does not support sending transactions");
    }

    // Create transaction with transfer instruction
    const transaction = new Transaction().add(
      createTransferInstruction(
        sourceAccount, // Source
        destinationAccount, // Destination
        wallet.publicKey!, // Owner
        amount // Amount
      )
    );

    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, "confirmed");

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
  wallet: SolanaWallet,
  mintAddress: string,
  amount: number
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(wallet.publicKey);

    if (!mintAddress || mintAddress.length === 0) {
      throw new Error("Invalid mint address");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const mint = new PublicKey(mintAddress);

    // Get token account
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      wallet.publicKey!
    );

    if (!wallet.sendTransaction) {
      throw new Error("Wallet does not support sending transactions");
    }

    // Create transaction with burn instruction
    const transaction = new Transaction().add(
      createBurnInstruction(
        tokenAccount, // Account
        mint, // Mint
        wallet.publicKey!, // Owner
        amount // Amount
      )
    );

    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, "confirmed");

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

// Approve tokens (allow another address to spend tokens)
export const approveTokens = async (
  connection: Connection,
  wallet: SolanaWallet,
  mintAddress: string,
  delegateAddress: string,
  amount: number
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(wallet.publicKey);

    if (!mintAddress || mintAddress.length === 0) {
      throw new Error("Invalid mint address");
    }

    if (!delegateAddress || delegateAddress.length === 0) {
      throw new Error("Invalid delegate address");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const mint = new PublicKey(mintAddress);
    const delegate = new PublicKey(delegateAddress);

    // Get token account
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      wallet.publicKey!
    );

    if (!wallet.sendTransaction) {
      throw new Error("Wallet does not support sending transactions");
    }

    // Create transaction with approve instruction
    const transaction = new Transaction().add(
      createApproveInstruction(
        tokenAccount, // Account
        delegate, // Delegate
        wallet.publicKey!, // Owner
        amount // Amount
      )
    );

    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, "confirmed");

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

// Revoke approval
export const revokeApproval = async (
  connection: Connection,
  wallet: SolanaWallet,
  mintAddress: string
): Promise<TransactionResult> => {
  try {
    ensureWalletConnected(wallet.publicKey);

    if (!mintAddress || mintAddress.length === 0) {
      throw new Error("Invalid mint address");
    }

    const mint = new PublicKey(mintAddress);

    // Get token account
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      wallet.publicKey!
    );

    if (!wallet.sendTransaction) {
      throw new Error("Wallet does not support sending transactions");
    }

    // Create transaction with revoke instruction
    const transaction = new Transaction().add(
      createRevokeInstruction(
        tokenAccount, // Account
        wallet.publicKey! // Owner
      )
    );

    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, "confirmed");

    return {
      signature,
      success: true,
    };
  } catch (error) {
    console.error("Error revoking approval:", error);
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

    if (!mintAddress || mintAddress.length === 0) {
      throw new Error("Invalid mint address");
    }

    const mint = new PublicKey(mintAddress);

    // Get associated token address
    const tokenAccountAddress = await getAssociatedTokenAddress(
      mint,
      publicKey!
    );

    // Get account info
    const accountInfo = await getAccount(connection, tokenAccountAddress);
    const mintInfo = await getMint(connection, mint);

    return {
      mint: mintAddress,
      account: safeToBase58(tokenAccountAddress),
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
    if (!mintAddress || mintAddress.length === 0) {
      throw new Error("Invalid mint address");
    }

    const mint = new PublicKey(mintAddress);
    const mintInfo = await getMint(connection, mint);

    return {
      address: mintAddress,
      decimals: mintInfo.decimals,
      supply: Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals),
      mintAuthority: mintInfo.mintAuthority
        ? safeToBase58(mintInfo.mintAuthority)
        : null,
      freezeAuthority: mintInfo.freezeAuthority
        ? safeToBase58(mintInfo.freezeAuthority)
        : null,
    };
  } catch (error) {
    console.error("Error getting mint info:", error);
    return null;
  }
};

// Check if token account exists
export const tokenAccountExists = async (
  connection: Connection,
  publicKey: PublicKey | null,
  mintAddress: string
): Promise<boolean> => {
  try {
    ensureWalletConnected(publicKey);

    if (!mintAddress || mintAddress.length === 0) {
      return false;
    }

    const mint = new PublicKey(mintAddress);
    const tokenAccountAddress = await getAssociatedTokenAddress(
      mint,
      publicKey!
    );

    const accountInfo = await connection.getAccountInfo(tokenAccountAddress);
    return accountInfo !== null;
  } catch (error) {
    console.error("Error checking token account existence:", error);
    return false;
  }
};
