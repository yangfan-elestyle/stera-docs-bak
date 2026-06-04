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
  const doc = structuredClone(value);
  normalizeMediaTypes(doc);
  await writeFile(
    `${outputDir}/${name}`,
    `${JSON.stringify(doc, null, 2)}\n`,
    'utf8',
  );
}

// 剥掉 media type 参数：application/json;charset=utf-8 -> application/json。
// RFC 8259 未给 application/json 定义 charset 参数（加了对合规接收方无效），
// 且该参数会让 fumadocs 的 cURL 生成器把请求体误渲染成 XML
// （go/python/java/csharp/js 生成器经 resolveMediaAdapter 已自行归一化，唯独 curl 没有）。
function normalizeMediaTypes(node: unknown): void {
  if (Array.isArray(node)) {
    node.forEach(normalizeMediaTypes);
    return;
  }
  if (!node || typeof node !== 'object') return;
  const obj = node as Record<string, unknown>;
  const content = obj.content;
  if (content && typeof content === 'object' && !Array.isArray(content)) {
    const map = content as Record<string, unknown>;
    for (const mediaType of Object.keys(map)) {
      const base = mediaType.split(';')[0].trim();
      if (base !== mediaType) {
        map[base] ??= map[mediaType];
        delete map[mediaType];
      }
    }
  }
  for (const key of Object.keys(obj)) normalizeMediaTypes(obj[key]);
}
