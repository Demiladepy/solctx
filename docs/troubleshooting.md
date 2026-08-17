# Troubleshooting

Common issues and fixes.

## `OPENAI_API_KEY is not set`

The server validates required env vars on boot. Copy `.env.example` to `.env`
and fill in your key, or pass it via the MCP client's `env` block (see the
[quickstart](./quickstart.md)).

## `docs index not found`

[`get_docs`](./tools/get-docs.md) needs the embedded corpus. Generate it:

```bash
pnpm build:index
```

This writes `data/docs-index.json` (gitignored). It requires `OPENAI_API_KEY`.

## RPC rate limits / timeouts

The public devnet endpoint is rate limited. If
[`get_chain_state`](./tools/get-chain-state.md) returns errors under load, set
`SOLANA_RPC_URL` to a dedicated RPC provider. Reads are cached for 5 seconds to
reduce call volume. See [network-support.md](./network-support.md).

## MCP client can't connect

- Confirm you ran `pnpm build` and the path in your client config points at
  `dist/index.js` (absolute path).
- The server logs `solctx MCP server running on stdio` to **stderr** on success.
- Never write to stdout yourself — it carries the JSON-RPC channel.

## Stale `docs-index.json`

If you edit the corpus in `scripts/build-docs-index.ts`, re-run
`pnpm build:index` to regenerate the index. The old file is overwritten.

## Airdrop failures on devnet

Devnet airdrops (used by the [examples](./examples-library.md)) are rate
limited. If `requestAirdrop` fails, wait and retry, or use a funded keypair.

---

**Last synced:** 2026-08-17 (solana-web3.js@1.98.0)
