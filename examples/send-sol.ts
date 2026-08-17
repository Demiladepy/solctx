/**
 * send-sol.ts — Transfer SOL between two wallets on Solana devnet.
 *
 * Usage:
 *   1. pnpm add @solana/web3.js
 *   2. npx tsx examples/send-sol.ts
 *
 * The example generates two keypairs, airdrops SOL to the sender on devnet,
 * then transfers a small amount to the recipient and confirms the transaction.
 */
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

async function main(): Promise<void> {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  const sender = Keypair.generate();
  const recipient = Keypair.generate();

  // Fund the sender on devnet (1 SOL) and wait for confirmation.
  const airdropSig = await connection.requestAirdrop(
    sender.publicKey,
    LAMPORTS_PER_SOL,
  );
  await connection.confirmTransaction(airdropSig, 'confirmed');

  // Build and send a transfer of 0.1 SOL.
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: recipient.publicKey,
      lamports: 0.1 * LAMPORTS_PER_SOL,
    }),
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    sender,
  ]);

  console.log('Transfer confirmed:', signature);
  console.log(
    'Recipient balance (lamports):',
    await connection.getBalance(recipient.publicKey),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
