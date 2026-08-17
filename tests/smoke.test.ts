import { describe, it, expect } from 'vitest';
import { createServer, TOOL_COUNT } from '../src/server.js';
import { rankChunks } from '../src/lib/search.js';

describe('server', () => {
  it('creates a server with 4 tools registered', () => {
    const server = createServer({
      solanaRpcUrl: 'https://api.devnet.solana.com',
    });
    expect(server).toBeDefined();
    expect(TOOL_COUNT).toBe(4);
  });
});

describe('rankChunks', () => {
  const corpus = [
    { id: 'a', source_url: 'u/a', text: 'Derive a program derived address PDA from seeds and a program id.' },
    { id: 'b', source_url: 'u/b', text: 'Transfer SOL between wallets using SystemProgram transfer in lamports.' },
    { id: 'c', source_url: 'u/c', text: 'An associated token account holds an SPL token mint for an owner.' },
  ];

  it('ranks the most relevant chunk first', () => {
    const [top] = rankChunks('how do I derive a PDA', corpus, 3);
    expect(top.source_url).toBe('u/a');
    expect(top.score).toBeGreaterThan(0);
  });

  it('returns at most topN results', () => {
    expect(rankChunks('token', corpus, 1)).toHaveLength(1);
  });
});
