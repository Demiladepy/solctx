# get_docs

> Search curated Solana documentation — local by default, semantic when enabled.

## What it does

Ranks a query against a pre-built index of curated Solana documentation chunks
and returns the three closest matches with their source URLs. It has two modes,
chosen automatically:

- **`bm25`** (default) — local keyword ranking. Offline, no API key, no cost.
- **`semantic`** — embedding similarity via OpenRouter, used when an
  `OPENROUTER_API_KEY` is configured *and* the index was built with embeddings
  (`pnpm build:index` with the key set). Falls back to BM25 if the API call
  fails.

The index is built once with `pnpm build:index`. The response includes a `mode`
field so you can see which path was used.

## Input schema

```typescript
{
  query: string  // 3–300 characters
}
```

## Output schema

```typescript
{
  mode: string;   // "bm25" | "semantic (<model>)" | fallback note
  chunks: Array<{
    text: string;
    source_url: string;
    score: number;   // BM25 relevance (bm25) or cosine similarity 0–1 (semantic)
  }>;  // top 3
}
```

## Usage examples

**Example 1: concept lookup (default BM25)**
> Ask Claude: "Using solctx, search docs for associated token account"

Returns:
```json
{
  "mode": "bm25",
  "chunks": [
    {
      "text": "An Associated Token Account (ATA) is the canonical account that holds a specific SPL token mint for a given owner...",
      "source_url": "https://solana.com/docs/core/tokens",
      "score": 6.11
    }
  ]
}
```

**Example 2: same query with semantic mode enabled**
> Ask Claude: "Using solctx, how do priority fees work?"

Returns:
```json
{
  "mode": "semantic (nvidia/nemotron-3-embed-1b:free)",
  "chunks": [
    {
      "text": "Priority fees let a transaction bid for faster inclusion...",
      "source_url": "https://solana.com/docs/core/fees",
      "score": 0.47
    }
  ]
}
```

## Known limitations

- Requires `pnpm build:index` to have generated `data/docs-index.json`; until
  then the tool returns an actionable error. See
  [troubleshooting.md](../troubleshooting.md).
- Corpus is curated and intentionally small (v1); coverage grows by editing
  `scripts/build-docs-index.ts`.
- Semantic mode needs the index rebuilt *with* the key so chunk embeddings
  exist; a key alone (index built without it) stays on BM25.
- BM25 is keyword-based: paraphrases sharing no words with the docs may rank
  lower than semantic mode would.

---

**Last synced:** 2026-08-17 (solana-web3.js@1.98.0)
