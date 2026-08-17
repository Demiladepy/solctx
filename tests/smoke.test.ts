import { describe, it, expect } from 'vitest';
import { createServer, TOOL_COUNT } from '../src/server.js';

describe('server', () => {
  it('creates a server with 4 tools registered', () => {
    const server = createServer({
      solanaRpcUrl: 'https://api.devnet.solana.com',
      openaiApiKey: 'sk-test',
    });
    expect(server).toBeDefined();
    expect(TOOL_COUNT).toBe(4);
  });
});
