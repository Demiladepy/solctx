/**
 * create-token-account.ts — Create an Associated Token Account (ATA) on devnet.
 *
 * Usage:
 *   1. pnpm add @solana/web3.js @solana/spl-token
 *   2. npx tsx examples/create-token-account.ts
 *
 * The ATA is the canonical account that holds a given SPL mint for an owner.
 * getOrCreateAssociatedTokenAccount derives the address and creates it on chain
 * if it does not already exist.
 */
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  createMint,
  getAssociatedTokenAddress,
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

  // The derived address is deterministic for (mint, owner).
  const expectedAddress = await getAssociatedTokenAddress(mint, payer.publicKey);

  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
  );

  console.log('Derived ATA address:', expectedAddress.toBase58());
  console.log('Created/loaded ATA:', ata.address.toBase58());
  console.log('Matches:', expectedAddress.equals(ata.address));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
