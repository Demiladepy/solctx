import { describe, it, expect } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import type { ToolContext } from '../src/types.js';
import { getChainStateInput } from '../src/tools/get-chain-state.js';
import { getDocsInput } from '../src/tools/get-docs.js';
import { getExampleInput, getExampleTool } from '../src/tools/get-example.js';
import { getSyncStatusInput, getSyncStatusTool } from '../src/tools/get-sync-status.js';
import {
  getProgramAddressesInput,
  getProgramAddressesTool,
} from '../src/tools/get-program-addresses.js';

const ctx: ToolContext = {
  solanaRpcUrl: 'https://api.devnet.solana.com',
  embeddingModel: 'nvidia/nemotron-3-embed-1b:free',
};

/** Parse a tool result's text payload as JSON. */
async function callJson(
  tool: { handler: (i: unknown, c: ToolContext) => Promise<{ content: Array<{ text?: string }> }> },
  input: unknown,
): Promise<unknown> {
  const res = await tool.handler(input, ctx);
  return JSON.parse(res.content[0].text ?? '');
}

describe('input schemas', () => {
  it('get_chain_state accepts exactly its declared queries', () => {
    const queries = getChainStateInput.shape.query.options;
    expect(queries).toContain('slot');
    for (const q of queries) {
      expect(getChainStateInput.parse({ query: q }).query).toBe(q);
    }
    expect(() => getChainStateInput.parse({ query: 'bogus' })).toThrow();
  });

  it('get_docs enforces query length bounds', () => {
    expect(getDocsInput.parse({ query: 'PDA derivation' }).query).toBe('PDA derivation');
    expect(() => getDocsInput.parse({ query: 'no' })).toThrow();
    expect(() => getDocsInput.parse({ query: 'x'.repeat(301) })).toThrow();
  });

  it('get_example / get_sync_status / get_program_addresses reject unknown enums', () => {
    expect(() => getExampleInput.parse({ task: 'mine_bitcoin' })).toThrow();
    expect(() => getSyncStatusInput.parse({ section: 'nope' })).toThrow();
    expect(() => getProgramAddressesInput.parse({ category: 'nfts' })).toThrow();
    expect(getExampleInput.parse({ task: 'derive_pda' }).task).toBe('derive_pda');
    expect(getProgramAddressesInput.parse({ category: 'all' }).category).toBe('all');
  });
});

describe('get_program_addresses handler', () => {
  it('returns the canonical SPL token program id', async () => {
    const spl = (await callJson(getProgramAddressesTool, { category: 'spl' })) as Record<string, Record<string, string>>;
    expect(spl.spl.token_program).toBe('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
  });

  it('"all" returns every category', async () => {
    const all = (await callJson(getProgramAddressesTool, { category: 'all' })) as Record<string, unknown>;
    expect(Object.keys(all).sort()).toEqual(['defi', 'governance', 'native', 'nft', 'spl']);
  });

  it('native and nft categories resolve to known programs', async () => {
    const native = (await callJson(getProgramAddressesTool, { category: 'native' })) as Record<string, Record<string, string>>;
    expect(native.native.system_program).toBe('11111111111111111111111111111111');
    const nft = (await callJson(getProgramAddressesTool, { category: 'nft' })) as Record<string, Record<string, string>>;
    expect(nft.nft.metaplex_token_metadata).toBe('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  });

  it('every listed address is a valid base58 public key (catches typos)', async () => {
    const all = (await callJson(getProgramAddressesTool, { category: 'all' })) as Record<string, Record<string, string>>;
    for (const category of Object.values(all)) {
      for (const address of Object.values(category)) {
        expect(new PublicKey(address).toBase58()).toBe(address);
      }
    }
  });
});

describe('get_example handler', () => {
  it('returns a titled, linked example for a known task', async () => {
    const ex = (await callJson(getExampleTool, { task: 'send_sol' })) as Record<string, string>;
    expect(ex.title).toBeTruthy();
    expect(ex.full_file_link).toBe('examples/send-sol.ts');
    expect(ex.code_snippet).toContain('SystemProgram');
  });
});

describe('get_sync_status handler', () => {
  it('returns just the requested section', async () => {
    const one = (await callJson(getSyncStatusTool, { section: 'quickstart' })) as Record<string, unknown>;
    expect(Object.keys(one)).toEqual(['quickstart']);
  });

  it('"all" returns the full map of sections', async () => {
    const all = (await callJson(getSyncStatusTool, { section: 'all' })) as Record<string, unknown>;
    expect(Object.keys(all).length).toBeGreaterThanOrEqual(8);
    expect(all).toHaveProperty('tools/get-chain-state');
  });
});
