import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from '../types.js';
import { dataPath } from '../lib/data-path.js';
import { cosineSimilarity, embedQuery } from '../lib/embeddings.js';

export const getDocsInput = z.object({
  query: z.string().min(3).max(300),
});

/** One embedded documentation chunk, as stored in `data/docs-index.json`. */
export interface DocChunk {
  id: string;
  text: string;
  source_url: string;
  embedding: number[];
}

let cachedIndex: DocChunk[] | null = null;

/** Load and memoise the embedded documentation index from disk. */
async function loadIndex(): Promise<DocChunk[]> {
  if (cachedIndex) return cachedIndex;
  let raw: string;
  try {
    raw = await readFile(dataPath('docs-index.json'), 'utf8');
  } catch {
    throw new Error(
      'docs index not found. Run `pnpm build:index` to generate ' +
        'data/docs-index.json (requires OPENAI_API_KEY).',
    );
  }
  cachedIndex = JSON.parse(raw) as DocChunk[];
  return cachedIndex;
}

/**
 * `get_docs` — semantic search over the embedded Solana documentation index.
 * Embeds the query, scores it against every chunk by cosine similarity, and
 * returns the top 3 matches with their source URLs.
 */
export const getDocsTool: ToolModule<typeof getDocsInput> = {
  name: 'get_docs',
  description:
    'Semantic search over curated Solana documentation. Returns the top ' +
    'matching doc chunks with their source URLs.',
  inputSchema: getDocsInput,
  async handler(input, context): Promise<CallToolResult> {
    const index = await loadIndex();
    const queryEmbedding = await embedQuery(input.query, context.openaiApiKey);
    const chunks = index
      .map((chunk) => ({
        text: chunk.text,
        source_url: chunk.source_url,
        score: Number(
          cosineSimilarity(queryEmbedding, chunk.embedding).toFixed(4),
        ),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    return {
      content: [{ type: 'text', text: JSON.stringify({ chunks }, null, 2) }],
    };
  },
};
