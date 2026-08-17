import { z } from 'zod';
import type { ToolModule } from '../types.js';
import { NotImplementedError } from '../types.js';

export const getChainStateInput = z.object({
  query: z.enum([
    'slot',
    'block_height',
    'epoch',
    'recent_priority_fee',
    'network_status',
  ]),
});

/**
 * `get_chain_state` — read a single live datapoint from Solana devnet.
 * Handler implemented in Phase 2.
 */
export const getChainStateTool: ToolModule<typeof getChainStateInput> = {
  name: 'get_chain_state',
  description:
    'Read live Solana devnet chain state: current slot, block height, epoch, ' +
    'recent priority fee, or overall network status.',
  inputSchema: getChainStateInput,
  async handler() {
    throw new NotImplementedError('get_chain_state');
  },
};
