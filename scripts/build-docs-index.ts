/**
 * build-docs-index — builder for `data/docs-index.json`.
 *
 * Writes a curated corpus of Solana devnet documentation chunks to disk for the
 * `get_docs` tool. By default it writes a BM25-only index (no API key, no
 * network, no cost). If OPENROUTER_API_KEY is set, it also embeds each chunk so
 * get_docs can do semantic search; EMBEDDING_MODEL overrides the model.
 *
 * The corpus is inlined here so the build is deterministic and easy to review.
 * Add entries to CORPUS to expand coverage, then re-run the script.
 */
import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { DEFAULT_EMBEDDING_MODEL, embed } from '../src/lib/embeddings.js';

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
  {
    id: 'versioned-transactions',
    source_url: 'https://solana.com/docs/core/transactions/versions',
    text: 'Versioned transactions (VersionedTransaction with TransactionMessage.compileToV0Message) support Address Lookup Tables, letting a single transaction reference far more accounts than the legacy format. Build a v0 message, sign it, and send with `connection.sendTransaction(versionedTx)`.',
  },
  {
    id: 'address-lookup-tables',
    source_url: 'https://solana.com/docs/advanced/lookup-tables',
    text: 'Address Lookup Tables (ALTs) store account addresses on chain so a versioned transaction can reference them by 1-byte index instead of a full 32-byte key. Create one with `AddressLookupTableProgram.createLookupTable`, extend it, then pass the resolved table into `compileToV0Message`.',
  },
  {
    id: 'cross-program-invocation',
    source_url: 'https://solana.com/docs/core/cpi',
    text: 'A Cross-Program Invocation (CPI) is one program calling another within a single transaction, using `invoke` or `invoke_signed` (the latter signs with PDA seeds). CPIs are limited to a depth of 4 and pass the same AccountInfo references down the call stack.',
  },
  {
    id: 'rent-exemption',
    source_url: 'https://solana.com/docs/core/fees',
    text: 'Accounts must hold a minimum lamport balance to be rent-exempt, proportional to their data size. Compute it with `connection.getMinimumBalanceForRentExemption(dataLen)`. Sub-exempt accounts are purged; almost all accounts are created rent-exempt.',
  },
  {
    id: 'token-2022',
    source_url: 'https://solana.com/docs/core/tokens',
    text: 'Token-2022 (Token Extensions) is a superset of the SPL Token program adding features like transfer fees, confidential transfers, and metadata pointers via extensions. Its program id is TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb; pass it explicitly since accounts are not interchangeable with the classic Token program.',
  },
  {
    id: 'get-program-accounts',
    source_url: 'https://solana.com/docs/rpc/http/getprogramaccounts',
    text: 'Fetch all accounts owned by a program with `connection.getProgramAccounts(programId, { filters })`. Use `dataSize` and `memcmp` filters to narrow results server-side; unfiltered scans are heavy and often disabled on public RPCs.',
  },
  {
    id: 'simulate-transaction',
    source_url: 'https://solana.com/docs/rpc/http/simulatetransaction',
    text: 'Preview a transaction without submitting it using `connection.simulateTransaction(tx)`. The result returns program logs, compute units consumed, and any error — use it to catch failures and size compute budgets before paying fees.',
  },
  {
    id: 'commitment-levels',
    source_url: 'https://solana.com/docs/rpc',
    text: 'RPC reads accept a commitment level: `processed` (fastest, may be rolled back), `confirmed` (voted on by a supermajority, a good default), and `finalized` (rooted, irreversible). Higher commitment trades latency for certainty.',
  },
  {
    id: 'durable-nonces',
    source_url: 'https://solana.com/docs/advanced/introduction-to-durable-nonces',
    text: 'Durable nonces replace a recent blockhash with a stored nonce account value, letting a transaction stay valid indefinitely until used — useful for offline or multi-signer signing. Create a nonce account and put `SystemProgram.nonceAdvance` as the first instruction.',
  },
  {
    id: 'spl-token-decimals',
    source_url: 'https://solana.com/docs/core/tokens',
    text: 'SPL token amounts are integers in base units; the mint\'s `decimals` field defines the display scale. A mint with 6 decimals represents 1.5 tokens as 1_500_000 base units. Always convert with `amount * 10 ** decimals`, never floats.',
  },
  {
    id: 'compute-unit-price',
    source_url: 'https://solana.com/docs/core/fees',
    text: 'Total priority fee = compute units used × compute unit price (micro-lamports). Set the price with `ComputeBudgetProgram.setComputeUnitPrice` and cap units with `setComputeUnitLimit`. Request only the units you need so the fee stays low.',
  },
  {
    id: 'websocket-subscriptions',
    source_url: 'https://solana.com/docs/rpc/websocket',
    text: 'Subscribe to live updates over WebSocket: `connection.onAccountChange(pubkey, cb)`, `onLogs(filter, cb)`, and `onProgramAccountChange`. Each returns a subscription id you pass to the matching `remove*Listener` to unsubscribe.',
  },
  {
    id: 'anchor-pda',
    source_url: 'https://www.anchor-lang.com/docs/pdas',
    text: 'In Anchor, declare a PDA account with `#[account(seeds = [...], bump)]` and Anchor derives and verifies it automatically. Off chain, mirror the derivation with `PublicKey.findProgramAddressSync(seeds, programId)` using the same seeds and program id.',
  },
  {
    id: 'transaction-size-limit',
    source_url: 'https://solana.com/docs/core/transactions',
    text: 'A serialized transaction must fit in 1232 bytes. Large transactions hit this limit as accounts and instructions grow; Address Lookup Tables and splitting work across transactions are the usual fixes.',
  },
  {
    id: 'associated-token-idempotent',
    source_url: 'https://solana.com/docs/core/tokens',
    text: 'Use `createAssociatedTokenAccountIdempotentInstruction` when a transaction may run more than once or the ATA might already exist — it succeeds whether or not the account is present, avoiding "account already in use" errors.',
  },
  {
    id: 'lamports-per-sol',
    source_url: 'https://solana.com/docs/core/tokens',
    text: 'One SOL is 1_000_000_000 lamports (the constant LAMPORTS_PER_SOL). All balances, transfers, and fees are denominated in lamports; convert for display with `lamports / LAMPORTS_PER_SOL`.',
  },
];

async function main(): Promise<void> {
  const outPath = fileURLToPath(
    new URL('../data/docs-index.json', import.meta.url),
  );
  const apiKey = process.env.OPENROUTER_API_KEY;

  let index: Array<CorpusEntry & { embedding?: number[] }>;
  if (apiKey) {
    const model = process.env.EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL;
    console.error(`Embedding ${CORPUS.length} chunks with ${model}...`);
    const vectors = await embed(
      CORPUS.map((c) => c.text),
      apiKey,
      model,
    );
    index = CORPUS.map((c, i) => ({ ...c, embedding: vectors[i] }));
    console.error(`Wrote ${index.length} chunks to ${outPath} (semantic index).`);
  } else {
    index = CORPUS;
    console.error(
      `Wrote ${index.length} chunks to ${outPath} (BM25-only, no API key).`,
    );
  }

  await writeFile(outPath, JSON.stringify(index, null, 2), 'utf8');
}

main().catch((err: unknown) => {
  console.error(
    'build-docs-index failed:',
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
});
