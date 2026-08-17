/**
 * build-docs-index — one-time builder for `data/docs-index.json`.
 *
 * Embeds a curated corpus of Solana devnet documentation chunks with OpenAI's
 * text-embedding-3-small model and writes them to disk for `get_docs` to
 * search. Run with: `pnpm build:index` (requires OPENAI_API_KEY).
 *
 * The corpus is inlined here (rather than scraped) so the build is
 * deterministic, offline-friendly apart from the embedding call, and easy to
 * review. Add entries to CORPUS to expand coverage.
 */
import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { embedQuery } from '../src/lib/embeddings.js';

interface CorpusEntry {
  id: string;
  source_url: string;
  text: string;
}

const CORPUS: CorpusEntry[] = [
  {
    id: 'quickstart-connection',
    source_url: 'https://solana.com/docs/clients/javascript',
    text: 'Create a devnet connection with @solana/web3.js: `const connection = new Connection("https://api.devnet.solana.com", "confirmed")`. The commitment level "confirmed" waits for a supermajority of the cluster to vote on a block and is a good default for most apps.',
  },
  {
    id: 'keypair-generate',
    source_url: 'https://solana.com/docs/clients/javascript',
    text: 'Generate a new wallet keypair with `Keypair.generate()`. Restore one from a secret key with `Keypair.fromSecretKey(Uint8Array)`. The public key is accessed via `keypair.publicKey` and is the account address on chain.',
  },
  {
    id: 'airdrop-devnet',
    source_url: 'https://solana.com/docs/core/tokens',
    text: 'On devnet you can fund a wallet with `connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL)`, which returns a transaction signature. There are 1_000_000_000 lamports in 1 SOL (LAMPORTS_PER_SOL). Airdrops are rate limited on devnet.',
  },
  {
    id: 'transfer-sol',
    source_url: 'https://solana.com/docs/core/transactions',
    text: 'Transfer SOL by building a transaction with `SystemProgram.transfer({ fromPubkey, toPubkey, lamports })` and sending it with `sendAndConfirmTransaction(connection, transaction, [payer])`. Amounts are always in lamports.',
  },
  {
    id: 'associated-token-account',
    source_url: 'https://solana.com/docs/core/tokens',
    text: 'An Associated Token Account (ATA) is the canonical account that holds a specific SPL token mint for a given owner. Derive its address with `getAssociatedTokenAddress(mint, owner)` and create it with `getOrCreateAssociatedTokenAccount(connection, payer, mint, owner)` from @solana/spl-token.',
  },
  {
    id: 'transfer-spl-token',
    source_url: 'https://solana.com/docs/core/tokens',
    text: 'Transfer SPL tokens with the `transfer(connection, payer, sourceAta, destinationAta, owner, amount)` helper from @solana/spl-token. Both source and destination must be associated token accounts for the same mint. Amount is in the token base units, accounting for decimals.',
  },
  {
    id: 'program-derived-address',
    source_url: 'https://solana.com/docs/core/pda',
    text: 'A Program Derived Address (PDA) is an address derived deterministically from seeds and a program id, off the ed25519 curve, so no private key exists. Derive one with `PublicKey.findProgramAddressSync(seeds, programId)`, which returns the address and a bump seed used to push the address off the curve.',
  },
  {
    id: 'pda-bump',
    source_url: 'https://solana.com/docs/core/pda',
    text: 'The bump seed returned by findProgramAddressSync is the highest value (starting at 255 and decreasing) that produces a valid off-curve PDA. Store the canonical bump and reuse it to avoid recomputing, and to prevent an attacker supplying a different valid bump.',
  },
  {
    id: 'read-account-data',
    source_url: 'https://solana.com/docs/core/accounts',
    text: 'Fetch raw account data with `connection.getAccountInfo(publicKey)`, which returns lamports, owner, and a data Buffer. Deserialize the data buffer according to the owning program layout. For token accounts, use `getAccount(connection, address)` from @solana/spl-token to get a typed result.',
  },
  {
    id: 'account-model',
    source_url: 'https://solana.com/docs/core/accounts',
    text: 'Every Solana account has an owner program, a lamport balance, and a data field. Only the owner program can modify an account\'s data or debit its lamports. Accounts must stay rent-exempt by holding a minimum lamport balance proportional to their data size.',
  },
  {
    id: 'priority-fees',
    source_url: 'https://solana.com/docs/core/fees',
    text: 'Priority fees let a transaction bid for faster inclusion. Add a `ComputeBudgetProgram.setComputeUnitPrice({ microLamports })` instruction to set the price per compute unit. Query recent fees with `connection.getRecentPrioritizationFees()` to pick a competitive value.',
  },
  {
    id: 'compute-budget',
    source_url: 'https://solana.com/docs/core/fees',
    text: 'Use `ComputeBudgetProgram.setComputeUnitLimit({ units })` to request a specific compute unit limit for a transaction. Transactions default to 200,000 compute units per instruction; complex instructions may need to raise this explicitly.',
  },
  {
    id: 'confirm-transaction',
    source_url: 'https://solana.com/docs/core/transactions',
    text: 'After sending a transaction, confirm it with the returned signature. `sendAndConfirmTransaction` blocks until confirmation. For manual control use `connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight })` with a recent blockhash from `getLatestBlockhash()`.',
  },
  {
    id: 'blockhash-expiry',
    source_url: 'https://solana.com/docs/core/transactions',
    text: 'Every transaction includes a recent blockhash that expires after ~150 blocks (roughly 60-90 seconds). If a transaction is not confirmed before its blockhash expires it is dropped and must be rebuilt with a fresh blockhash from `getLatestBlockhash()`.',
  },
  {
    id: 'devnet-endpoint',
    source_url: 'https://solana.com/docs/core/clusters',
    text: 'Solana devnet is a public test cluster with a free faucet, reachable at https://api.devnet.solana.com. It mirrors mainnet-beta behavior but tokens have no value. Public RPC endpoints are rate limited; use a dedicated RPC provider for heavier workloads.',
  },
];

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it to .env before running.');
  }

  console.error(`Embedding ${CORPUS.length} documentation chunks...`);
  const index = [];
  for (const entry of CORPUS) {
    const embedding = await embedQuery(entry.text, apiKey);
    index.push({ ...entry, embedding });
    console.error(`  ✓ ${entry.id}`);
  }

  const outPath = fileURLToPath(new URL('../data/docs-index.json', import.meta.url));
  await writeFile(outPath, JSON.stringify(index, null, 2), 'utf8');
  console.error(`Wrote ${index.length} chunks to ${outPath}`);
}

main().catch((err: unknown) => {
  console.error('build-docs-index failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
