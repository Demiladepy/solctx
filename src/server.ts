import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import type { ToolContext, ToolModule } from './types.js';
import { getChainStateTool } from './tools/get-chain-state.js';
import { getDocsTool } from './tools/get-docs.js';
import { getExampleTool } from './tools/get-example.js';
import { getSyncStatusTool } from './tools/get-sync-status.js';
import { getProgramAddressesTool } from './tools/get-program-addresses.js';

/** All tools exposed by the server, in list order. */
const tools: ToolModule[] = [
  getChainStateTool,
  getDocsTool,
  getExampleTool,
  getSyncStatusTool,
  getProgramAddressesTool,
];

/** Number of tools registered — used by tests. */
export const TOOL_COUNT = tools.length;

/**
 * Build the MCP server for solctx: registers the `list_tools` and `call_tool`
 * handlers over the provided runtime context. Every tool call is wrapped so an
 * unhandled exception is returned to the client as a labelled error result
 * rather than crashing the transport.
 *
 * @param context Runtime configuration (RPC URL).
 * @returns A configured, not-yet-connected {@link Server}.
 */
export function createServer(context: ToolContext): Server {
  const server = new Server(
    { name: 'solctx', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(
      (tool): Tool => ({
        name: tool.name,
        description: tool.description,
        // zod-to-json-schema emits a JSON Schema 7 object; the MCP Tool type
        // wants the narrower `{ type: "object", ... }` shape. The cast is safe
        // because every tool input schema is a `z.object(...)`.
        inputSchema: zodToJsonSchema(tool.inputSchema, {
          target: 'jsonSchema7',
          $refStrategy: 'none',
        }) as Tool['inputSchema'],
      }),
    ),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = tools.find((t) => t.name === request.params.name);
    if (!tool) {
      return {
        content: [
          { type: 'text', text: `Unknown tool: ${request.params.name}` },
        ],
        isError: true,
      };
    }

    const rawArgs = request.params.arguments ?? {};
    try {
      const input = tool.inputSchema.parse(rawArgs);
      return await tool.handler(input, context);
    } catch (err) {
      const detail =
        err instanceof z.ZodError
          ? `invalid input: ${err.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`
          : err instanceof Error
            ? err.message
            : String(err);
      return {
        content: [
          {
            type: 'text',
            text:
              `Error calling ${tool.name} with ` +
              `${JSON.stringify(rawArgs)}: ${detail}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
