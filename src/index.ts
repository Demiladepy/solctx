import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import type { ToolContext } from './types.js';

/**
 * Read configuration into a {@link ToolContext}. No secrets are required; the
 * only setting is the Solana RPC URL, which defaults to public devnet.
 */
function loadContext(): ToolContext {
  const solanaRpcUrl =
    process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
  return { solanaRpcUrl };
}

/** Boot the MCP server and connect it over stdio. */
async function main(): Promise<void> {
  const context = loadContext();
  const server = createServer(context);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr so we never corrupt the stdio JSON-RPC channel on stdout.
  console.error('solctx MCP server running on stdio');
}

main().catch((err: unknown) => {
  console.error('Fatal: failed to start solctx MCP server');
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
