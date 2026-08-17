# get_docs

> Semantic search over curated Solana documentation.

## What it does

Embeds the query and scores it against a pre-built index of curated Solana
documentation chunks by cosine similarity, returning the three closest matches
with their source URLs. The index is built once with `pnpm build:index`.

## Input schema

```typescript
{
  query: string  // 3–300 characters
}
```

## Output schema

```typescript
{
  chunks: Array<{
    text: string;
    source_url: string;
    score: number;   // cosine similarity, 0–1
  }>;  // top 3
}
```

## Usage examples

**Example 1: concept lookup**
> Ask Claude: "Using solctx, search docs for associated token account"

Returns:
```json
{
  "chunks": [
    {
      "text": "An Associated Token Account (ATA) is the canonical account that holds a specific SPL token mint for a given owner...",
      "source_url": "https://solana.com/docs/core/tokens",
      "score": 0.61
    }
  ]
}
```

**Example 2: how-to lookup**
> Ask Claude: "Using solctx, how do priority fees work?"

Returns:
```json
{
  "chunks": [
    {
      "text": "Priority fees let a transaction bid for faster inclusion...",
      "source_url": "https://solana.com/docs/core/fees",
      "score": 0.55
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
- Each query costs one OpenAI embedding call.

---

**Last synced:** 2026-08-17 (solana-web3.js@1.98.0)
