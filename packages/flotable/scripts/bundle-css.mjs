/**
 * Bundle all component CSS files into a single dist/flotable.css.
 * Consumers can import 'flotable/dist/flotable.css' for all styles at once.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const SRC = new URL('../src', import.meta.url).pathname;
const DIST = new URL('../dist', import.meta.url).pathname;

async function collectCss(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await collectCss(full));
    } else if (entry.name.endsWith('.css')) {
      files.push(full);
    }
  }
  return files;
}

const cssFiles = await collectCss(SRC);
const parts = [];
for (const file of cssFiles) {
  const rel = relative(SRC, file);
  const content = await readFile(file, 'utf-8');
  parts.push(`/* ${rel} */\n${content}`);
}

await mkdir(DIST, { recursive: true });
await writeFile(join(DIST, 'flotable.css'), parts.join('\n\n'));
console.log(`Bundled ${cssFiles.length} CSS files → dist/flotable.css`);
