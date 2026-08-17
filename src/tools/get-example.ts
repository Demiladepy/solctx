import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from '../types.js';
import { dataPath } from '../lib/data-path.js';

export const getExampleInput = z.object({
  task: z.enum([
    'send_sol',
    'send_spl_token',
    'create_token_account',
    'derive_pda',
    'read_account_data',
  ]),
});

/** Shape of each entry in `data/examples.json`. */
interface ExampleEntry {
  title: string;
  explanation: string;
  code_snippet: string;
  full_file: string;
}

let cachedExamples: Record<string, ExampleEntry> | null = null;

/** Load and memoise the examples metadata from disk. */
async function loadExamples(): Promise<Record<string, ExampleEntry>> {
  if (cachedExamples) return cachedExamples;
  const raw = await readFile(dataPath('examples.json'), 'utf8');
  cachedExamples = JSON.parse(raw) as Record<string, ExampleEntry>;
  return cachedExamples;
}

/**
 * `get_example` — return a canonical, runnable Solana devnet code example for a
 * supported task, including a short inline snippet and a link to the full file.
 */
export const getExampleTool: ToolModule<typeof getExampleInput> = {
  name: 'get_example',
  description:
    'Return a canonical, runnable Solana devnet code example for a common ' +
    'task (send SOL, send SPL token, create token account, derive PDA, read ' +
    'account data).',
  inputSchema: getExampleInput,
  async handler(input): Promise<CallToolResult> {
    const examples = await loadExamples();
    const entry = examples[input.task];
    if (!entry) {
      throw new Error(`No example found for task "${input.task}".`);
    }
    const result = {
      title: entry.title,
      explanation: entry.explanation,
      code_snippet: entry.code_snippet,
      full_file_link: entry.full_file,
    };
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};
