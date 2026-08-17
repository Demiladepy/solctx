import { fileURLToPath } from 'node:url';

/**
 * Resolve a file inside the repo-root `data/` directory. Works both from
 * compiled output (`dist/lib`) and from `tsx` (`src/lib`) because both sit two
 * levels below the repo root.
 *
 * @param file File name relative to `data/`, e.g. `"docs-index.json"`.
 */
export function dataPath(file: string): string {
  return fileURLToPath(new URL(`../../data/${file}`, import.meta.url));
}
