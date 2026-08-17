import OpenAI from 'openai';

/** Embedding model used for both index build and query time. */
export const EMBEDDING_MODEL = 'text-embedding-3-small';

/**
 * Embed a single string into a dense vector using OpenAI's embedding model.
 *
 * @param text Text to embed.
 * @param apiKey OpenAI API key.
 * @returns The embedding vector.
 */
export async function embedQuery(
  text: string,
  apiKey: string,
): Promise<number[]> {
  const client = new OpenAI({ apiKey });
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Cosine similarity between two equal-length vectors. Returns 0 if either
 * vector has zero magnitude.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
