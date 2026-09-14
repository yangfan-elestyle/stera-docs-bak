import { mkdir, writeFile } from 'node:fs/promises';
import openapiJa from '../openapi.yaml';
import openapiEn from '../openapi.en.yaml';
import openapiZh from '../openapi.zh.yaml';

const outputDir = 'data/openapi';

assertTagsDeclared('openapi.yaml', openapiJa);
assertTagsDeclared('openapi.en.yaml', openapiEn);
assertTagsDeclared('openapi.zh.yaml', openapiZh);

await mkdir(outputDir, { recursive: true });

await Promise.all([
  writeJson('openapi.json', openapiJa),
  writeJson('openapi.en.json', openapiEn),
  writeJson('openapi.zh.json', openapiZh),
]);

// generate-openapi.ts 用 groupBy: 'tag' 分组; 操作引用了未在顶层 `tags:` 声明的
// tag 时 fumadocs 不报错, 只会静默产出错误的目录结构 -> 在生成入口显式拦截。
function assertTagsDeclared(name: string, doc: unknown): void {
  const d = doc as {
    tags?: Array<{ name?: string }>;
    paths?: Record<string, Record<string, unknown>>;
  };
  const declared = new Set(
    (d.tags ?? []).map((t) => t?.name).filter((n): n is string => !!n),
  );
  const missing = new Set<string>();
  for (const pathItem of Object.values(d.paths ?? {})) {
    if (!pathItem || typeof pathItem !== 'object') continue;
    for (const op of Object.values(pathItem)) {
      const tags = (op as { tags?: unknown })?.tags;
      if (!Array.isArray(tags)) continue;
      for (const t of tags) {
        if (typeof t === 'string' && !declared.has(t)) missing.add(t);
      }
    }
  }
  if (missing.size) {
    throw new Error(
      `${name}: 操作使用了未在顶层 \`tags:\` 声明的 tag: ${[...missing].sort().join(', ')}`,
    );
  }
}

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
