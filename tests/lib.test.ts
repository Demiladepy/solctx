import { describe, it, expect } from 'vitest';
import { TtlCache } from '../src/lib/cache.js';
import { withTimeout } from '../src/lib/solana-client.js';
import { cosineSimilarity } from '../src/lib/embeddings.js';
import { rankChunks } from '../src/lib/search.js';

describe('TtlCache', () => {
  it('computes once and serves cached value within the TTL', async () => {
    const cache = new TtlCache(1000);
    let calls = 0;
    const factory = async () => ++calls;
    expect(await cache.getOrSet('k', factory)).toBe(1);
    expect(await cache.getOrSet('k', factory)).toBe(1);
    expect(calls).toBe(1);
  });

  it('keys are independent', async () => {
    const cache = new TtlCache(1000);
    let calls = 0;
    const factory = async () => ++calls;
    await cache.getOrSet('a', factory);
    await cache.getOrSet('b', factory);
    expect(calls).toBe(2);
  });

  it('recomputes after the TTL expires', async () => {
    const cache = new TtlCache(10);
    let calls = 0;
    const factory = async () => ++calls;
    await cache.getOrSet('k', factory);
    await new Promise((r) => setTimeout(r, 25));
    await cache.getOrSet('k', factory);
    expect(calls).toBe(2);
  });
});

describe('withTimeout', () => {
  it('resolves when the promise beats the timeout', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 100)).resolves.toBe('ok');
  });
  it('rejects with a clear message when the timeout wins', async () => {
    const slow = new Promise((r) => setTimeout(r, 200));
    await expect(withTimeout(slow, 20, 'test op')).rejects.toThrow(
      /test op timed out after 20ms/,
    );
  });
});

describe('cosineSimilarity', () => {
  it('is 1 for identical direction', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
  });
  it('is 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });
  it('is 0 when a vector has zero magnitude', () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});

describe('rankChunks (BM25)', () => {
  const corpus = [
    { id: 'a', source_url: 'u/a', text: 'Derive a program derived address PDA from seeds and a program id.' },
    { id: 'b', source_url: 'u/b', text: 'Transfer SOL between wallets using SystemProgram transfer in lamports.' },
    { id: 'c', source_url: 'u/c', text: 'An associated token account holds an SPL token mint for an owner.' },
  ];

  it('ranks the most relevant chunk first', () => {
    expect(rankChunks('how do I derive a PDA', corpus, 3)[0].source_url).toBe('u/a');
    expect(rankChunks('transfer SOL between wallets', corpus, 3)[0].source_url).toBe('u/b');
    expect(rankChunks('associated token account', corpus, 3)[0].source_url).toBe('u/c');
  });

  it('respects the topN limit', () => {
    expect(rankChunks('token', corpus, 1)).toHaveLength(1);
    expect(rankChunks('token', corpus, 3).length).toBeLessThanOrEqual(3);
  });

  it('gives a positive score to matches and 0 to non-matches', () => {
    expect(rankChunks('PDA', corpus, 1)[0].score).toBeGreaterThan(0);
    const none = rankChunks('zzzzqqq nonexistentword', corpus, 3);
    expect(none.every((c) => c.score === 0)).toBe(true);
  });

  it('ignores case and stopwords', () => {
    expect(rankChunks('HOW to DERIVE a pda', corpus, 1)[0].source_url).toBe('u/a');
  });
});
