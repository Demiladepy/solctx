# get_sync_status

> Report when documentation sections were last verified against the protocol.

## What it does

Reads `data/sync-metadata.json` and reports, per documentation section, when it
was last verified, the protocol version it was verified against, and any known
drift notes. Returns a single section or the full map.

## Input schema

```typescript
{
  section:
    | 'quickstart'
    | 'network-support'
    | 'examples-library'
    | 'troubleshooting'
    | 'tools/get-docs'
    | 'tools/get-chain-state'
    | 'tools/get-example'
    | 'tools/get-sync-status'
    | 'all'
}
```

## Output schema

```typescript
// section: a specific name
{
  [section: string]: {
    verified_at: string;        // ISO 8601
    protocol_version: string;
    drift_notes: string | null;
  }
}
// section: 'all' → the full map keyed by section name
```

## Usage examples

**Example 1: one section**
> Ask Claude: "Using solctx, when was the quickstart last verified?"

Returns:
```json
{
  "quickstart": {
    "verified_at": "2026-08-17T00:00:00Z",
    "protocol_version": "solana-web3.js@1.98.0",
    "drift_notes": null
  }
}
```

**Example 2: everything**
> Ask Claude: "Using solctx, show all doc sync status"

Returns:
```json
{
  "quickstart": { "verified_at": "2026-08-17T00:00:00Z", "protocol_version": "solana-web3.js@1.98.0", "drift_notes": null },
  "network-support": { "verified_at": "2026-08-17T00:00:00Z", "protocol_version": "solana-web3.js@1.98.0", "drift_notes": null }
}
```

## Known limitations

- Metadata is maintained by hand (or by an upstream doc-sync workflow); it is
  not auto-computed from git history in v1.
- `drift_notes` is free-form and may be `null`.

---

**Last synced:** 2026-08-17 (solana-web3.js@1.98.0)
