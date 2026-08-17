/**
 * OpenRouter embeddings — optional semantic-search backend for `get_docs`.
 *
 * Uses the native `fetch` against OpenRouter's OpenAI-compatible embeddings
 * endpoint, so no SDK dependency is needed. Only used when an OpenRouter API
 * key is configured; otherwise `get_docs` falls back to local BM25.
 */
const OPENROUTER_EMBEDDINGS_URL = 'https://openrouter.ai/api/v1/embeddings';

/** Default embedding model — free tier on OpenRouter. Override with EMBEDDING_MODEL. */
export const DEFAULT_EMBEDDING_MODEL = 'nvidia/nemotron-3-embed-1b:free';

interface EmbeddingResponse {
  data: Array<{ embedding: number[] }>;
}

/**
 * Embed one or more strings via OpenRouter. Returns one vector per input, in
 * order.
 *
 * @param inputs Texts to embed.
 * @param apiKey OpenRouter API key.
 * @param model Embedding model id.
 * @throws If the API responds with a non-2xx status.
 */
export async function embed(
  inputs: string[],
  apiKey: string,
  model: string,
): Promise<number[][]> {
  const response = await fetch(OPENROUTER_EMBEDDINGS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, input: inputs }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `OpenRouter embeddings request failed (${response.status}): ${detail}`,
    );
  }
  const json = (await response.json()) as EmbeddingResponse;
  return json.data.map((d) => d.embedding);
}

/** Embed a single query string. */
export async function embedQuery(
  text: string,
  apiKey: string,
  model: string,
): Promise<number[]> {
  const [vector] = await embed([text], apiKey, model);
  return vector;
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
