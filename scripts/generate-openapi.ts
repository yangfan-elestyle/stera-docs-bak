import { generateFiles } from 'fumadocs-openapi';
import { openapi } from '@/lib/openapi';
import { rm } from 'node:fs/promises';

await rm('./content/docs/openapi/(generated)', {
  recursive: true,
  force: true,
});

await generateFiles({
  input: openapi,
  output: './content/docs/openapi/(generated)',
  includeDescription: true,
  groupBy: 'tag',
});
