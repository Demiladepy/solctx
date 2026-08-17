import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolContext, ToolModule } from '../types.js';
import { dataPath } from '../lib/data-path.js';
import { rankChunks, type RankableChunk, type ScoredChunk } from '../lib/search.js';
import { cosineSimilarity, embedQuery } from '../lib/embeddings.js';

export const getDocsInput = z.object({
  query: z.string().min(3).max(300),
});

/** One documentation chunk, as stored in `data/docs-index.json`. */
export interface DocChunk extends RankableChunk {
  /** Present only when the index was built with an embedding model. */
  embedding?: number[];
}

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

/** Rank chunks by cosine similarity of query embedding against chunk embeddings. */
async function semanticRank(
  query: string,
  index: DocChunk[],
  context: ToolContext,
): Promise<ScoredChunk[]> {
  const queryVec = await embedQuery(
    query,
    context.openrouterApiKey!,
    context.embeddingModel,
  );
  return index
    .map((chunk) => ({
      text: chunk.text,
      source_url: chunk.source_url,
      score: Number(cosineSimilarity(queryVec, chunk.embedding!).toFixed(4)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

/**
 * `get_docs` — search the curated Solana docs corpus.
 *
 * Default: local BM25 keyword ranking (offline, no key, no cost). If an
 * OpenRouter key is configured *and* the index was built with embeddings, it
 * upgrades to semantic search, falling back to BM25 if the API call fails.
 */
export const getDocsTool: ToolModule<typeof getDocsInput> = {
  name: 'get_docs',
  description:
    'Search curated Solana documentation. Uses local BM25 keyword ranking by ' +
    'default, or semantic embeddings when an OpenRouter key is configured. ' +
    'Returns the top matching doc chunks with their source URLs.',
  inputSchema: getDocsInput,
  async handler(input, context): Promise<CallToolResult> {
    const index = await loadIndex();
    const canEmbed =
      Boolean(context.openrouterApiKey) &&
      index.length > 0 &&
      index.every((c) => Array.isArray(c.embedding));

    let mode: string;
    let chunks: ScoredChunk[];
    if (canEmbed) {
      try {
        chunks = await semanticRank(input.query, index, context);
        mode = `semantic (${context.embeddingModel})`;
      } catch {
        chunks = rankChunks(input.query, index, 3);
        mode = 'bm25 (semantic call failed, fell back)';
      }
    } else {
      chunks = rankChunks(input.query, index, 3);
      mode = 'bm25';
    }

    return {
      content: [
        { type: 'text', text: JSON.stringify({ mode, chunks }, null, 2) },
      ],
    };
  },
};
