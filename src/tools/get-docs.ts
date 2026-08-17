import { z } from 'zod';
import type { ToolModule } from '../types.js';
import { NotImplementedError } from '../types.js';

export const getDocsInput = z.object({
  query: z.string().min(3).max(300),
});

/**
 * `get_docs` — semantic search over an embedded Solana documentation index.
 * Handler implemented in Phase 2.
 */
export const getDocsTool: ToolModule<typeof getDocsInput> = {
  name: 'get_docs',
  description:
    'Semantic search over curated Solana documentation. Returns the top ' +
    'matching doc chunks with their source URLs.',
  inputSchema: getDocsInput,
  async handler() {
    throw new NotImplementedError('get_docs');
  },
};
