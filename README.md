# solctx

**Live, structured Solana devnet context for AI coding agents — over MCP.**

solctx is a [Model Context Protocol](https://modelcontextprotocol.io) server that
gives AI coding agents (Claude Desktop, Claude Code, and any other MCP client)
first-class access to Solana devnet: searchable documentation, live chain state,
canonical runnable code examples, and doc-sync status.

## Why

AI agents writing Solana code work from stale, half-remembered training data.
solctx closes that gap by exposing four focused tools an agent can call on demand
instead of guessing.

## Tools

| Tool | Purpose |
| --- | --- |
| [`get_chain_state`](docs/tools/get-chain-state.md) | Read live devnet state: slot, block height, epoch, priority fee, network status |
| [`get_docs`](docs/tools/get-docs.md) | Search curated Solana docs — local BM25, or semantic embeddings when enabled |
| [`get_example`](docs/tools/get-example.md) | Canonical, runnable code examples for common tasks |
| [`get_sync_status`](docs/tools/get-sync-status.md) | When each doc section was last verified against the protocol |

## Quickstart

See [docs/quickstart.md](docs/quickstart.md) for full setup. In short:

```bash
pnpm install
pnpm build
pnpm build:index          # write the local docs index (no API key)
pnpm start                # MCP server on stdio
```

Then register solctx with your MCP client (see the quickstart for a Claude
Desktop config snippet).

## Documentation

- [Quickstart](docs/quickstart.md)
- [Network support](docs/network-support.md)
- [Examples library](docs/examples-library.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Changelog](docs/changelog.md)

## Requirements

- Node.js 20+
- pnpm 9+

No API keys required — doc search runs locally (BM25) and chain reads use a
public RPC. Optionally set `OPENROUTER_API_KEY` to upgrade `get_docs` to
semantic search (free-tier model by default).

## License

[MIT](LICENSE)

---

**Last synced:** 2026-08-17 (solana-web3.js@1.98.0)
