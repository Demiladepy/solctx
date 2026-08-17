import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from '../types.js';
import { dataPath } from '../lib/data-path.js';
import { rankChunks, type RankableChunk } from '../lib/search.js';

export const getDocsInput = z.object({
  query: z.string().min(3).max(300),
});

/** One documentation chunk, as stored in `data/docs-index.json`. */
export type DocChunk = RankableChunk;

let cachedIndex: DocChunk[] | null = null;

/** Load and memoise the documentation index from disk. */
async function loadIndex(): Promise<DocChunk[]> {
  if (cachedIndex) return cachedIndex;
  let raw: string;
  try {
    raw = await readFile(dataPath('docs-index.json'), 'utf8');
  } catch {
    throw new Error(
      'docs index not found. Run `pnpm build:index` to generate ' +
        'data/docs-index.json (no API key required).',
    );
  }
  cachedIndex = JSON.parse(raw) as DocChunk[];
  return cachedIndex;
}

/**
 * `get_docs` — local lexical (BM25) search over the curated Solana docs corpus.
 * Ranks the query against every chunk and returns the top 3 with source URLs.
 * Fully offline: no embeddings, no API key, no cost.
 */
export const getDocsTool: ToolModule<typeof getDocsInput> = {
  name: 'get_docs',
  description:
    'Search curated Solana documentation (local BM25 keyword ranking). ' +
    'Returns the top matching doc chunks with their source URLs.',
  inputSchema: getDocsInput,
  async handler(input): Promise<CallToolResult> {
    const index = await loadIndex();
    const chunks = rankChunks(input.query, index, 3);
    return {
      content: [{ type: 'text', text: JSON.stringify({ chunks }, null, 2) }],
    };
  },
};
