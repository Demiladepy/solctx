/**
 * read-account-data.ts — Fetch and deserialize account data on devnet.
 *
 * Usage:
 *   1. pnpm add @solana/web3.js @solana/spl-token
 *   2. npx tsx examples/read-account-data.ts
 *
 * Shows both the low-level getAccountInfo (raw lamports/owner/data) and the
 * typed getAccount helper for SPL token accounts.
 */
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  createMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';

async function main(): Promise<void> {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  const payer = Keypair.generate();
  await connection.confirmTransaction(
    await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL),
    'confirmed',
  );

  const mint = await createMint(connection, payer, payer.publicKey, null, 6);
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
  );

  // Low-level: raw account info (owner program, lamports, data buffer length).
  const info = await connection.getAccountInfo(ata.address);
  console.log('Owner program:', info?.owner.toBase58());
  console.log('Lamports:', info?.lamports);
  console.log('Data bytes:', info?.data.length);

  // Typed: deserialized SPL token account.
  const account = await getAccount(connection, ata.address);
  console.log('Token account mint:', account.mint.toBase58());
  console.log('Token balance:', account.amount.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
