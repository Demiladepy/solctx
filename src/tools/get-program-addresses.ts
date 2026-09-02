import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from '../types.js';
import { dataPath } from '../lib/data-path.js';

export const getProgramAddressesInput = z.object({
  category: z.enum(['native', 'spl', 'defi', 'nft', 'governance', 'all']),
});

/** Catalog shape: category → { label → base58 program address }. */
type ProgramCatalog = Record<string, Record<string, string>>;

let cachedCatalog: ProgramCatalog | null = null;

/** Load and memoise the program-address catalog from disk. */
async function loadCatalog(): Promise<ProgramCatalog> {
  if (cachedCatalog) return cachedCatalog;
  const raw = await readFile(dataPath('program-addresses.json'), 'utf8');
  cachedCatalog = JSON.parse(raw) as ProgramCatalog;
  return cachedCatalog;
}

/**
 * `get_program_addresses` — look up well-known Solana program addresses by
 * category (SPL, DeFi, governance). Returns the requested category, or the full
 * catalog for `all`.
 */
export const getProgramAddressesTool: ToolModule<typeof getProgramAddressesInput> = {
  name: 'get_program_addresses',
  description:
    'Look up canonical Solana program addresses by category: native (system, ' +
    'compute budget, address lookup table, stake, vote), spl (token, ' +
    'token-2022, associated token, memo), defi (Jupiter, Raydium, Orca), nft ' +
    '(Metaplex Token Metadata), governance (SPL Governance), or all.',
  inputSchema: getProgramAddressesInput,
  async handler(input): Promise<CallToolResult> {
    const catalog = await loadCatalog();
    const result =
      input.category === 'all'
        ? catalog
        : { [input.category]: catalog[input.category] };
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};
