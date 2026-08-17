import { z } from 'zod';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolContext, ToolModule } from '../types.js';
import { chainCache, getConnection } from '../lib/solana-client.js';

export const getChainStateInput = z.object({
  query: z.enum([
    'slot',
    'block_height',
    'epoch',
    'recent_priority_fee',
    'network_status',
  ]),
});

type ChainQuery = z.infer<typeof getChainStateInput>['query'];

/** Median of a numeric array; 0 for an empty array. */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Run a single chain-state query against the given RPC connection. */
async function runQuery(
  query: ChainQuery,
  context: ToolContext,
): Promise<Record<string, unknown>> {
  const connection = getConnection(context.solanaRpcUrl);
  switch (query) {
    case 'slot':
      return { slot: await connection.getSlot() };
    case 'block_height':
      return { block_height: await connection.getBlockHeight() };
    case 'epoch': {
      const info = await connection.getEpochInfo();
      return {
        epoch: info.epoch,
        slot_index: info.slotIndex,
        slots_in_epoch: info.slotsInEpoch,
        absolute_slot: info.absoluteSlot,
      };
    }
    case 'recent_priority_fee': {
      const fees = await connection.getRecentPrioritizationFees();
      return {
        median_priority_fee_micro_lamports: median(
          fees.map((f) => f.prioritizationFee),
        ),
        samples: fees.length,
      };
    }
    case 'network_status': {
      const start = Date.now();
      const version = await connection.getVersion();
      return {
        status: 'ok',
        rpc_url: context.solanaRpcUrl,
        ping_ms: Date.now() - start,
        solana_core: version['solana-core'],
      };
    }
  }
}

/**
 * `get_chain_state` — read a single live datapoint from Solana devnet, cached
 * for 5 seconds to avoid redundant RPC calls.
 */
export const getChainStateTool: ToolModule<typeof getChainStateInput> = {
  name: 'get_chain_state',
  description:
    'Read live Solana devnet chain state: current slot, block height, epoch, ' +
    'recent priority fee, or overall network status.',
  inputSchema: getChainStateInput,
  async handler(input, context): Promise<CallToolResult> {
    const result = await chainCache.getOrSet(input.query, () =>
      runQuery(input.query, context),
    );
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};
