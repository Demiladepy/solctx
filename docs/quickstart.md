# Quickstart

Get solctx running and connected to an MCP client in a few minutes.

## Prerequisites

- Node.js 20+
- pnpm 9+
- An OpenAI API key (used to embed the documentation corpus for `get_docs`)

## 1. Install

```bash
pnpm install
```

## 2. Configure environment

Copy the example env file and fill in your key:

```bash
cp .env.example .env
```

```
OPENAI_API_KEY=sk-your-key-here
SOLANA_RPC_URL=https://api.devnet.solana.com
```

`SOLANA_RPC_URL` is optional and defaults to the public devnet endpoint. See
[network-support.md](./network-support.md) for details.

## 3. Build

```bash
pnpm build
```

## 4. Build the documentation index

This embeds the curated Solana docs corpus so [`get_docs`](./tools/get-docs.md)
can search it. It calls the OpenAI embeddings API (takes ~30–60s, costs ~$0.01).

```bash
pnpm build:index
```

## 5. Run

```bash
pnpm start
```

The server speaks MCP over stdio and logs `solctx MCP server running on stdio`
to stderr.

## 6. Register with an MCP client

For **Claude Desktop**, add this to your
`claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "solctx": {
      "command": "node",
      "args": ["/absolute/path/to/solctx/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-your-key-here",
        "SOLANA_RPC_URL": "https://api.devnet.solana.com"
      }
    }
  }
}
```

Restart the client, then try:

- "Using solctx, what's the current slot?"
- "Using solctx, search docs for associated token account"
- "Using solctx, show me how to derive a PDA"
- "Using solctx, when was the quickstart last verified?"

## Next steps

- [Tool reference](./tools/get-chain-state.md)
- [Examples library](./examples-library.md)
- [Troubleshooting](./troubleshooting.md)

---

**Last synced:** 2026-08-17 (solana-web3.js@1.98.0)
