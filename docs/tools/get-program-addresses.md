# get_program_addresses

> Look up canonical Solana program addresses by category.

## What it does

Returns well-known on-chain program IDs from a curated catalog on disk
(`data/program-addresses.json`). Use this instead of guessing program addresses
from training data — agents frequently hallucinate IDs or use deprecated ones.

## Input schema

```typescript
{
  category: 'native' | 'spl' | 'defi' | 'nft' | 'governance' | 'all'
}
```

## Output schema

```typescript
// category: 'spl'
{ spl: { token_program: string; token_2022_program: string; ... } }
// category: 'all'
{ native: {...}; spl: {...}; defi: {...}; nft: {...}; governance: {...} }
```

Each inner object maps a human-readable label to a base58 program address.

## Categories

| Category | Programs included |
| --- | --- |
| `native` | System, Compute Budget, Address Lookup Table, Stake, Vote |
| `spl` | Token, Token-2022, Associated Token, Memo |
| `defi` | Jupiter, Raydium, Orca |
| `nft` | Metaplex Token Metadata |
| `governance` | SPL Governance |

## Usage examples

**Example 1: SPL programs**
> Ask Claude: "Using solctx, list the SPL program addresses."

Returns the Token, Token-2022, Associated Token, and Memo program IDs.

**Example 2: full catalog**
> Ask Claude: "Using solctx, show me all canonical program addresses."

Returns every category in one response.

## Known limitations

- Devnet addresses match mainnet for system-level programs; some DeFi programs
  may differ by cluster. See [network-support.md](../network-support.md).
- The catalog is curated, not exhaustive — it covers the programs agents ask
  about most often.

---

**Last synced:** 2026-09-03 (solana-web3.js@1.98.0)
