# Changelog

All notable changes to solctx are documented here. This project follows
[semantic versioning](https://semver.org/).

## v0.2.0 (2026-09-03)

### Added

- [`get_program_addresses`](./tools/get-program-addresses.md) — canonical program
  IDs by category (native, SPL, DeFi, NFT, governance).
- `supply` query on [`get_chain_state`](./tools/get-chain-state.md) — total,
  circulating, and non-circulating SOL on devnet.
- Expanded `get_docs` corpus (15 → 31 topics): v0 transactions, ALTs, CPI,
  Token-2022, rent, and more.
- Expanded program catalog (6 → 14 programs): native, Token-2022, Orca, etc.
- RPC timeout hardening (`withTimeout`) for chain-state reads.
- Test coverage expanded (3 → 25 tests).

## v0.1.0 (2026-08-17) — Initial release

Initial v1 release.

### Added

- MCP server over stdio with four tools:
  - [`get_chain_state`](./tools/get-chain-state.md) — live devnet reads (slot,
    block height, epoch, recent priority fee, network status), cached 5s.
  - [`get_docs`](./tools/get-docs.md) — search over a curated corpus of Solana
    documentation. Local BM25 by default (no API key); optional semantic
    embeddings via OpenRouter when `OPENROUTER_API_KEY` is set.
  - [`get_example`](./tools/get-example.md) — five canonical, runnable devnet
    code examples.
  - [`get_sync_status`](./tools/get-sync-status.md) — doc-sync metadata per
    section.
- Documentation index builder (`pnpm build:index`).
- Baseline documentation and five runnable examples.

### Scope (intentionally not in v1)

- No web UI, CLI, auth layer, vector DB, or multi-chain support.
- Devnet only. See [network-support.md](./network-support.md) for the roadmap.

---

**Last synced:** 2026-09-03 (solana-web3.js@1.98.0)
