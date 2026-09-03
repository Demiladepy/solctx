# get_chain_state

> Read a single live datapoint from Solana devnet.

## What it does

Queries the configured Solana devnet RPC for one piece of chain state and
returns it as JSON. Results are cached for 5 seconds so repeated calls within a
short window don't hammer the RPC endpoint.

## Input schema

```typescript
{
  query: 'slot' | 'block_height' | 'epoch' | 'recent_priority_fee' | 'supply' | 'network_status'
}
```

## Output schema

```typescript
// query: 'slot'
{ slot: number }
// query: 'block_height'
{ block_height: number }
// query: 'epoch'
{ epoch: number; slot_index: number; slots_in_epoch: number; absolute_slot: number }
// query: 'recent_priority_fee'
{ median_priority_fee_micro_lamports: number; samples: number }
// query: 'supply'
{ total_sol: number; circulating_sol: number; non_circulating_sol: number }
// query: 'network_status'
{ status: 'ok'; rpc_url: string; ping_ms: number; solana_core: string }
```

## Usage examples

**Example 1: current slot**
> Ask Claude: "Using solctx, what's the current slot?"

Returns:
```json
{
  "slot": 484789767
}
```

**Example 2: SOL supply**
> Ask Claude: "Using solctx, what's the total SOL supply on devnet?"

Returns:
```json
{
  "total_sol": 1000000000,
  "circulating_sol": 999999500,
  "non_circulating_sol": 500
}
```

**Example 3: network health**
> Ask Claude: "Using solctx, is devnet healthy?"

Returns:
```json
{
  "status": "ok",
  "rpc_url": "https://api.devnet.solana.com",
  "ping_ms": 786,
  "solana_core": "4.2.0"
}
```

## Known limitations

- Devnet only; see [network-support.md](../network-support.md).
- `recent_priority_fee` returns the median of recent samples, which can be 0 on
  a quiet network.

---

**Last synced:** 2026-09-03 (solana-web3.js@1.98.0)
