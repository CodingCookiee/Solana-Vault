# Complete Guide to Solana Program Interactions

## Overview

This guide demonstrates how to interact with Solana programs from a Next.js frontend application. We'll cover both real deployed programs and example patterns you can use for your own programs.

## What You've Built

Your application now includes:

1. **Wallet Connection** - Connect to Phantom wallet
2. **SPL Token Operations** - Create, mint, transfer, and burn tokens
3. **Custom Program Interactions** - Interact with deployed Solana programs
4. **Account Reading** - Read on-chain account data

## 🚀 Ready-to-Use Features

### 1. Memo Program (Fully Functional)

The **Memo Program** is deployed on all Solana networks and allows you to store text messages on-chain.

**Program ID**: `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`

```typescript
// Example usage in your app
const result = await sendMemo(connection, wallet, "Hello, Solana!");
```

**What it does:**
- Stores your message permanently on the blockchain
- Creates a transaction that anyone can view
- Demonstrates basic program interaction patterns

### 2. Account Data Reader

Read any account's data on Solana:

```typescript
// Read account information
const accountData = await readAccountData(connection, new PublicKey("YOUR_ACCOUNT_ADDRESS"));
```

**Try these addresses:**
- Your wallet address
- Token mint addresses  
- Program addresses
- System Program: `11111111111111111111111111111111`

## 🛠️ Example Program Patterns

### Counter Program Example

This demonstrates the common pattern of:
1. **Initialize** - Create a new account to store data
2. **Update** - Modify data in the account
3. **Read** - Fetch current account state

```typescript
// Initialize counter
const result = await initializeCounter(connection, wallet, programId);

// Increment counter
await incrementCounter(connection, wallet, programId, counterAddress);

// Read counter data
const counterData = await getCounterData(connection, wallet, programId, counterAddress);
```

### Hello World Program Example

Shows how to:
1. Store string data on-chain
2. Associate data with the user's wallet
3. Create and update message accounts

## 📖 Key Concepts Explained

### 1. Program Derived Addresses (PDAs)

PDAs are deterministic addresses derived from seeds:

```typescript
// Calculate PDA
const [pda, bump] = calculatePDA(
  [Buffer.from("counter"), wallet.publicKey.toBuffer()],
  programId
);
```

### 2. Accounts and Instructions

Every Solana transaction contains:
- **Accounts** - Data storage locations
- **Instructions** - Operations to perform
- **Signers** - Who authorizes the transaction

### 3. IDL (Interface Definition Language)

IDLs define how to interact with programs:

```typescript
export const COUNTER_IDL: Idl = {
  version: "0.1.0",
  name: "counter",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "counter", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
      ],
      args: [],
    },
  ],
  // ... more definitions
};
```

## 🔧 How to Deploy Your Own Programs

### Step 1: Install Anchor CLI

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### Step 2: Initialize Anchor Project

```bash
anchor init my-solana-program
cd my-solana-program
```

### Step 3: Build and Deploy

```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Step 4: Get Program ID

After deployment, you'll get a Program ID like:
```
Program Id: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

### Step 5: Update Your Frontend

Replace the placeholder program IDs in your code:

```typescript
// In program-interactions.ts
export const EXAMPLE_PROGRAMS = {
  COUNTER: new PublicKey("YOUR_ACTUAL_PROGRAM_ID"),
  // ...
};
```

## 🌐 Real Programs You Can Interact With

### 1. System Program
- **ID**: `11111111111111111111111111111111`
- **Purpose**: Create accounts, transfer SOL
- **Always available**: Yes

### 2. Token Program
- **ID**: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
- **Purpose**: Create and manage SPL tokens
- **Always available**: Yes

### 3. Memo Program
- **ID**: `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`
- **Purpose**: Store text messages on-chain
- **Always available**: Yes

### 4. Associated Token Account Program
- **ID**: `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`
- **Purpose**: Manage token accounts
- **Always available**: Yes

## 🎯 Advanced Patterns

### 1. Cross-Program Invocation (CPI)

```typescript
// Your program can call other programs
const instruction = new TransactionInstruction({
  programId: otherProgramId,
  keys: accounts,
  data: instructionData,
});
```

### 2. Account Constraints

```rust
// In your Rust program
#[account(
    init,
    payer = user,
    space = 8 + 32 + 8,
    seeds = [b"counter", user.key().as_ref()],
    bump
)]
pub counter: Account<'info, Counter>,
```

### 3. Error Handling

```typescript
try {
  const result = await program.methods.increment().rpc();
} catch (error) {
  if (error.code === 6000) {
    // Handle specific program error
  }
}
```

## 🚨 Common Issues and Solutions

### 1. "Program not found" Error
- **Cause**: Program ID is incorrect or not deployed
- **Solution**: Verify program ID and deployment

### 2. "Account not found" Error
- **Cause**: Account hasn't been initialized
- **Solution**: Call initialize method first

### 3. "Insufficient funds" Error
- **Cause**: Not enough SOL for transaction fees
- **Solution**: Airdrop SOL on devnet: `solana airdrop 2`

### 4. "Invalid authority" Error
- **Cause**: Wrong wallet trying to update account
- **Solution**: Use the correct wallet that owns the account

## 🎉 Next Steps

1. **Deploy the Counter Program**: Use the provided Rust code to deploy your own counter program
2. **Experiment with the Memo Program**: Try sending different messages
3. **Read Account Data**: Explore different accounts on Solana
4. **Build Your Own Program**: Create a custom program for your specific needs

## 💡 Pro Tips

1. **Use Devnet**: Always test on devnet first
2. **Check Transaction Status**: Always wait for transaction confirmation
3. **Handle Errors Gracefully**: Network issues are common
4. **Cache Account Data**: Don't fetch the same data repeatedly
5. **Use TypeScript**: Strong typing prevents many bugs

## 🔍 Debugging Tools

- **Solana Explorer**: https://explorer.solana.com/?cluster=devnet
- **Solscan**: https://solscan.io/
- **Anchor Test**: `anchor test`
- **Solana CLI**: `solana logs` for real-time logs

## 📚 Additional Resources

- [Solana Cookbook](https://solanacookbook.com/)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Program Library](https://spl.solana.com/)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)

---

**Remember**: The example programs (Counter, Hello World) use placeholder IDs. Only the Memo Program is fully functional. To make the examples work, you'll need to deploy your own programs or find deployed versions of these programs.
