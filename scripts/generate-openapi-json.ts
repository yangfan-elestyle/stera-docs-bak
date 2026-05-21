import { mkdir, writeFile } from 'node:fs/promises';
import openapiJa from '../openapi.yaml';
import openapiEn from '../openapi.en.yaml';
import openapiZh from '../openapi.zh.yaml';

const outputDir = 'data/openapi';

await mkdir(outputDir, { recursive: true });

await Promise.all([
  writeJson('openapi.json', openapiJa),
  writeJson('openapi.en.json', openapiEn),
  writeJson('openapi.zh.json', openapiZh),
]);

async function writeJson(name: string, value: unknown) {
  await writeFile(
    `${outputDir}/${name}`,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8',
  );
}
