# Network support

## Current support

solctx targets **Solana devnet** only. This keeps v1 focused: devnet mirrors
mainnet-beta behavior, has a free faucet, and carries no real value — ideal for
agents learning and testing Solana code.

## RPC endpoint

Chain reads go through the endpoint in `SOLANA_RPC_URL`, defaulting to the public
devnet endpoint:

```
https://api.devnet.solana.com
```

You can point `SOLANA_RPC_URL` at any devnet-compatible RPC (for example a
dedicated provider) if you hit rate limits on the public endpoint.

## What happens if the RPC is down

[`get_chain_state`](./tools/get-chain-state.md) surfaces RPC failures as a
labelled error result to the MCP client rather than crashing the server. The
`network_status` query is the quickest way to check reachability and latency.

Chain reads are cached for 5 seconds, so brief blips may be served from cache.

## Roadmap

- mainnet-beta support (read-only)
- Configurable custom RPC per request
- Testnet support

These are intentionally **not** in v1. See [changelog.md](./changelog.md).

---

**Last synced:** 2026-08-17 (solana-web3.js@1.98.0)
