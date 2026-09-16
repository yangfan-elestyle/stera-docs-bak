import { readFileSync, readdirSync } from 'node:fs';
import * as path from 'node:path';

/** 一份正文, path 是含语言后缀的虚拟路径, 如 `(home)/get-started/set-up.en.mdx` */
export interface DocRecord {
  path: string;
  /** 原始 mdx, 含 frontmatter */
  source: string;
  updatedAt?: Date;
}

/** 一份导航, path 如 `(home)/meta.en.json` */
export interface MetaRecord {
  path: string;
  data: unknown;
  updatedAt?: Date;
}

export interface ContentSnapshot {
  docs: DocRecord[];
  metas: MetaRecord[];
}

export interface ContentProvider {
  load(): Promise<ContentSnapshot>;
}

const SEED_ROOT = path.join(process.cwd(), 'seed');
export const SEED_DOCS = path.join(SEED_ROOT, 'docs');
const SEED_UPDATED_AT = path.join(SEED_ROOT, 'updated-at.json');

/**
 * 随仓 seed。只在「新建库」时用一次: 空库启动或 `bun run import:seed`。
 * 同步实现是为了能被 lib/cms/db.ts 的同步单例初始化直接调用。
 *
 * 最終更新日不读 git: seed/docs 是从 content/docs 搬过来的, 搬家之后
 * `git log -- seed/docs/...` 只剩搬家那一个 commit, 210 页会挤成同一天。
 * 真实时间在搬家前一次性抓进 seed/updated-at.json。
 */
export function loadSeedSync(): ContentSnapshot {
  const updatedAt = readUpdatedAt();
  const docs: DocRecord[] = [];
  const metas: MetaRecord[] = [];

  for (const entry of readdirSync(SEED_DOCS, { recursive: true }) as string[]) {
    const virtualPath = entry.split(path.sep).join('/');
    const full = path.join(SEED_DOCS, entry);

    if (virtualPath.endsWith('.mdx')) {
      docs.push({
        path: virtualPath,
        source: readFileSync(full, 'utf-8'),
        updatedAt: updatedAt.get(virtualPath),
      });
    } else if (/(^|\/)meta[^/]*\.json$/.test(virtualPath)) {
      metas.push({
        path: virtualPath,
        data: JSON.parse(readFileSync(full, 'utf-8')),
        updatedAt: updatedAt.get(virtualPath),
      });
    }
  }

  docs.sort((a, b) => a.path.localeCompare(b.path));
  metas.sort((a, b) => a.path.localeCompare(b.path));
  return { docs, metas };
}

export function createSeedProvider(): ContentProvider {
  return { load: async () => loadSeedSync() };
}

function readUpdatedAt(): Map<string, Date> {
  const raw = JSON.parse(readFileSync(SEED_UPDATED_AT, 'utf-8')) as Record<
    string,
    string
  >;
  const map = new Map<string, Date>();
  for (const [key, value] of Object.entries(raw)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) map.set(key, date);
  }
  return map;
}
