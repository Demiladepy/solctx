import type { z } from 'zod';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Runtime configuration passed to every tool handler. No API keys are required:
 * chain reads use the RPC URL and doc search runs locally.
 */
export interface ToolContext {
  solanaRpcUrl: string;
}

/**
 * Documentation sections tracked by the doc-sync workflow. Mirrors the keys in
 * `data/sync-metadata.json` plus the `all` selector.
 */
export type SyncSection =
  | 'quickstart'
  | 'network-support'
  | 'examples-library'
  | 'troubleshooting'
  | 'tools/get-docs'
  | 'tools/get-chain-state'
  | 'tools/get-example'
  | 'tools/get-sync-status'
  | 'all';

/**
 * A self-contained MCP tool: its name, human-readable description, a zod input
 * schema (also rendered to JSON Schema for the MCP `list_tools` response), and
 * a handler that produces a `CallToolResult`.
 */
export interface ToolModule<S extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  description: string;
  inputSchema: S;
  handler(input: z.infer<S>, context: ToolContext): Promise<CallToolResult>;
}

/**
 * Thrown by tool handlers that have not been implemented yet. Surfaced to the
 * MCP client as a clean error rather than an unhandled exception.
 */
export class NotImplementedError extends Error {
  constructor(toolName: string) {
    super(`Tool "${toolName}" is not implemented yet.`);
    this.name = 'NotImplementedError';
  }
}
