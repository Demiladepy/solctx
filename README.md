# solctx

**Live, structured Solana devnet context for AI coding agents — over MCP.**

solctx is a [Model Context Protocol](https://modelcontextprotocol.io) server that
gives AI coding agents (Claude Desktop, Claude Code, and any other MCP client)
first-class access to Solana devnet: searchable documentation, live chain state,
canonical runnable code examples, and doc-sync status.

## Why

AI agents writing Solana code work from stale, half-remembered training data.
solctx closes that gap by exposing five focused tools an agent can call on demand
instead of guessing.

## Tools

| Tool | Purpose |
| --- | --- |
| [`get_chain_state`](docs/tools/get-chain-state.md) | Read live devnet state: slot, block height, epoch, priority fee, SOL supply, network status |
| [`get_docs`](docs/tools/get-docs.md) | Search curated Solana docs — local BM25, or semantic embeddings when enabled |
| [`get_example`](docs/tools/get-example.md) | Canonical, runnable code examples for common tasks |
| [`get_sync_status`](docs/tools/get-sync-status.md) | When each doc section was last verified against the protocol |
| [`get_program_addresses`](docs/tools/get-program-addresses.md) | Canonical program addresses by category (native, SPL, DeFi, NFT, governance) |

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

## Documentation site & Thally integration

Built for the **Thally Sync Hackathon (Track 1)**. The doc-sync workflow is the
point: this repo is the **product repository** that Thally's Track watches — when
code merges here, Track drafts documentation updates for review.

- **Live docs:** https://solctx-docs.vercel.app
- **Docs site repo:** [Demiladepy/solctx-docs](https://github.com/Demiladepy/solctx-docs) (Thally site — `docs.json` + `src/content/*.mdx`)
- **Platform feedback:** [`UPSTREAM_FINDINGS.md`](UPSTREAM_FINDINGS.md) — nine reproducible Thally bugs found while integrating, with repro steps, root causes, and fixes.

## License

[MIT](LICENSE)

---

**Last synced:** 2026-09-03 (solana-web3.js@1.98.0)
