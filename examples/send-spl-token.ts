/**
 * send-spl-token.ts — Transfer an SPL token between two wallets on devnet.
 *
 * Usage:
 *   1. pnpm add @solana/web3.js @solana/spl-token
 *   2. npx tsx examples/send-spl-token.ts
 *
 * The example creates a new mint, mints tokens to the sender's associated
 * token account, then transfers some to a recipient's associated token account.
 */
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} from '@solana/spl-token';

async function main(): Promise<void> {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  const payer = Keypair.generate();
  const recipient = Keypair.generate();
  await connection.confirmTransaction(
    await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL),
    'confirmed',
  );

  // Create a mint with 6 decimals, controlled by the payer.
  const mint = await createMint(connection, payer, payer.publicKey, null, 6);

  const senderAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
  );
  const recipientAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    recipient.publicKey,
  );

  // Mint 100 tokens (100 * 10^6 base units) to the sender, then transfer 25.
  await mintTo(connection, payer, mint, senderAta.address, payer, 100_000_000);
  const signature = await transfer(
    connection,
    payer,
    senderAta.address,
    recipientAta.address,
    payer,
    25_000_000,
  );

  console.log('SPL transfer confirmed:', signature);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
