/**
 * derive-pda.ts — Derive a Program Derived Address (PDA) on Solana.
 *
 * Usage:
 *   1. pnpm add @solana/web3.js
 *   2. npx tsx examples/derive-pda.ts
 *
 * A PDA is derived deterministically from seeds and a program id, and lies off
 * the ed25519 curve so no private key exists for it. This is a pure client-side
 * computation — no network call is required.
 */
import { PublicKey } from '@solana/web3.js';

function main(): void {
  // The SPL Token program id, used here as an example owning program.
  const programId = new PublicKey(
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  );

  const user = new PublicKey('11111111111111111111111111111111');

  // Seeds can be strings or public-key bytes. Here: a literal + an owner key.
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), user.toBuffer()],
    programId,
  );

  console.log('PDA:', pda.toBase58());
  console.log('Bump seed:', bump);
}

main();
