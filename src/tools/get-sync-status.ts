import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from '../types.js';
import { dataPath } from '../lib/data-path.js';

export const getSyncStatusInput = z.object({
  section: z.enum([
    'quickstart',
    'network-support',
    'examples-library',
    'troubleshooting',
    'tools/get-docs',
    'tools/get-chain-state',
    'tools/get-example',
    'tools/get-sync-status',
    'all',
  ]),
});

/** Sync metadata recorded for one documentation section. */
interface SectionMeta {
  verified_at: string;
  protocol_version: string;
  drift_notes: string | null;
}

let cachedMeta: Record<string, SectionMeta> | null = null;

/** Load and memoise the doc-sync metadata from disk. */
async function loadMeta(): Promise<Record<string, SectionMeta>> {
  if (cachedMeta) return cachedMeta;
  const raw = await readFile(dataPath('sync-metadata.json'), 'utf8');
  cachedMeta = JSON.parse(raw) as Record<string, SectionMeta>;
  return cachedMeta;
}

/**
 * `get_sync_status` — report when documentation sections were last verified.
 * Returns the full map for `section: "all"`, otherwise just the requested one.
 */
export const getSyncStatusTool: ToolModule<typeof getSyncStatusInput> = {
  name: 'get_sync_status',
  description:
    'Report doc-sync status: when each documentation section was last ' +
    'verified, the protocol version it was verified against, and any known ' +
    'drift notes.',
  inputSchema: getSyncStatusInput,
  async handler(input): Promise<CallToolResult> {
    const meta = await loadMeta();
    if (input.section === 'all') {
      return {
        content: [{ type: 'text', text: JSON.stringify(meta, null, 2) }],
      };
    }
    const entry = meta[input.section];
    if (!entry) {
      throw new Error(`No sync metadata for section "${input.section}".`);
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ [input.section]: entry }, null, 2),
        },
      ],
    };
  },
};
