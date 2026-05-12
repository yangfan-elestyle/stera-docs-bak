import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const url = process.env.DOCS_ERROR_CODES_URL;
const output = resolve(process.cwd(), 'data/error-codes.snapshot.json');
const stub = JSON.stringify(
  { generatedAt: new Date(0).toISOString(), items: [] },
  null,
  2,
);

mkdirSync(dirname(output), { recursive: true });

if (!url) {
  if (!existsSync(output)) {
    writeFileSync(output, stub);
    console.log(
      `[snapshot-error-codes] DOCS_ERROR_CODES_URL not set -> wrote empty stub at ${output}`,
    );
  } else {
    console.log(
      `[snapshot-error-codes] DOCS_ERROR_CODES_URL not set -> keeping existing ${output}`,
    );
  }
  process.exit(0);
}

try {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const text = await res.text();
  JSON.parse(text);
  writeFileSync(output, text);
  console.log(`[snapshot-error-codes] wrote ${output} (from ${url})`);
} catch (e) {
  const reason = e instanceof Error ? e.message : String(e);
  console.warn(`[snapshot-error-codes] fetch failed: ${reason}`);
  if (existsSync(output)) {
    console.warn(`[snapshot-error-codes] keeping existing ${output}`);
  } else {
    writeFileSync(output, stub);
    console.warn(`[snapshot-error-codes] wrote empty stub at ${output}`);
  }
}
