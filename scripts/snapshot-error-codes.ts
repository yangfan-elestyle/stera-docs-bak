import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { getDocsEnv, getErrorCodesUrl } from '../lib/env';

interface ErrorCodesResponse {
  generatedAt: string;
  items: unknown[];
}

const docsEnv = getDocsEnv();
const url = getErrorCodesUrl(docsEnv);
const output = resolve(process.cwd(), 'data/error-codes.snapshot.json');
const stub = JSON.stringify(
  { generatedAt: new Date(0).toISOString(), items: [] },
  null,
  2,
);

mkdirSync(dirname(output), { recursive: true });

function parseSnapshot(text: string): ErrorCodesResponse {
  const data = JSON.parse(text) as ErrorCodesResponse;

  if (!data || typeof data !== 'object' || !Array.isArray(data.items)) {
    throw new Error('invalid response: items must be an array');
  }

  return data;
}

try {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const text = await res.text();
  const data = parseSnapshot(text);
  writeFileSync(output, text);
  console.log(
    `[snapshot-error-codes] wrote ${output} (env=${docsEnv}, items=${data.items.length}, from ${url})`,
  );
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
