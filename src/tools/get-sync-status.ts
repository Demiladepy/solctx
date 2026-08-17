import { z } from 'zod';
import type { ToolModule } from '../types.js';
import { NotImplementedError } from '../types.js';

export const getSyncStatusInput = z.object({
  section: z.enum([
    'quickstart',
    'network-support',
    'examples-library',
    'troubleshooting',
    'tools/get-docs',
    'tools/get-chain-state',
    'tools/get-example',
    'tools/get-sync-status',
    'all',
  ]),
});

/**
 * `get_sync_status` — report when each documentation section was last verified
 * against the protocol, and any known drift. Handler implemented in Phase 3.
 */
export const getSyncStatusTool: ToolModule<typeof getSyncStatusInput> = {
  name: 'get_sync_status',
  description:
    'Report doc-sync status: when each documentation section was last ' +
    'verified, the protocol version it was verified against, and any known ' +
    'drift notes.',
  inputSchema: getSyncStatusInput,
  async handler() {
    throw new NotImplementedError('get_sync_status');
  },
};
