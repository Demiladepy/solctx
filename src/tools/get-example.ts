import { z } from 'zod';
import type { ToolModule } from '../types.js';
import { NotImplementedError } from '../types.js';

export const getExampleInput = z.object({
  task: z.enum([
    'send_sol',
    'send_spl_token',
    'create_token_account',
    'derive_pda',
    'read_account_data',
  ]),
});

/**
 * `get_example` — return a canonical, runnable Solana code example for a task.
 * Handler implemented in Phase 3.
 */
export const getExampleTool: ToolModule<typeof getExampleInput> = {
  name: 'get_example',
  description:
    'Return a canonical, runnable Solana devnet code example for a common ' +
    'task (send SOL, send SPL token, create token account, derive PDA, read ' +
    'account data).',
  inputSchema: getExampleInput,
  async handler() {
    throw new NotImplementedError('get_example');
  },
};
