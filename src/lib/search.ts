/** A small English stopword set — enough to keep BM25 focused on content terms. */
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'is',
  'are', 'be', 'how', 'do', 'does', 'i', 'you', 'it', 'that', 'this', 'as',
  'at', 'by', 'from', 'your', 'can', 'what', 'when', 'which', 'me', 'my',
]);

/** Lowercase, split on non-alphanumerics, drop stopwords and 1-char tokens. */
function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return matches.filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Minimal shape a chunk needs to be ranked. */
export interface RankableChunk {
  id: string;
  text: string;
  source_url: string;
}

/** A ranked result returned to the caller. */
export interface ScoredChunk {
  text: string;
  source_url: string;
  score: number;
}

/**
 * Rank documentation chunks against a query using Okapi BM25. Deterministic,
 * dependency-free, and offline — no embeddings or API calls.
 *
 * @param query The natural-language search query.
 * @param chunks The corpus to rank.
 * @param topN Maximum number of results to return (default 3).
 * @returns The top-N chunks by BM25 score, highest first.
 */
export function rankChunks(
  query: string,
  chunks: RankableChunk[],
  topN = 3,
): ScoredChunk[] {
  const n = chunks.length;
  if (n === 0) return [];

  const docs = chunks.map((c) => tokenize(c.text));
  const avgLen = docs.reduce((sum, d) => sum + d.length, 0) / n;

  // Document frequency: how many chunks contain each term.
  const docFreq = new Map<string, number>();
  for (const doc of docs) {
    for (const term of new Set(doc)) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  const queryTerms = tokenize(query);
  const k1 = 1.5;
  const b = 0.75;

  const scored = chunks.map((chunk, i) => {
    const doc = docs[i];
    const termFreq = new Map<string, number>();
    for (const term of doc) {
      termFreq.set(term, (termFreq.get(term) ?? 0) + 1);
    }

    let score = 0;
    for (const term of queryTerms) {
      const freq = termFreq.get(term);
      if (!freq) continue;
      const df = docFreq.get(term) ?? 0;
      const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
      const denom = freq + k1 * (1 - b + (b * doc.length) / avgLen);
      score += idf * ((freq * (k1 + 1)) / denom);
    }

    return {
      text: chunk.text,
      source_url: chunk.source_url,
      score: Number(score.toFixed(4)),
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}
