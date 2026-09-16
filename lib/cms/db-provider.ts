import { getDb } from './db';
import { toDocPath, toMetaPath } from './paths';
import type { ContentProvider, DocRecord, MetaRecord } from './provider';

interface DocRow {
  slug: string;
  locale: string;
  content: string;
  updated_at: number;
}

interface NavRow {
  dir: string;
  locale: string;
  data: string;
  updated_at: number;
}

/**
 * 库里读全量内容。
 *
 * 全量而非分页: files() 要交出完整的虚拟文件列表, fumadocs 才能建出页面树;
 * 结果由 dynamicLoader 缓存到下一次 revalidate(), 每次编辑只扫一遍 246 行。
 */
export function createDbProvider(): ContentProvider {
  return {
    async load() {
      const db = getDb();

      const docs = (
        db
          .prepare('SELECT slug, locale, content, updated_at FROM docs')
          .all() as unknown as DocRow[]
      ).map<DocRecord>((row) => ({
        path: toDocPath(row.slug, row.locale),
        source: row.content,
        updatedAt: new Date(row.updated_at),
      }));

      const metas = (
        db
          .prepare('SELECT dir, locale, data, updated_at FROM navigation')
          .all() as unknown as NavRow[]
      ).map<MetaRecord>((row) => ({
        path: toMetaPath(row.dir, row.locale),
        data: JSON.parse(row.data),
        updatedAt: new Date(row.updated_at),
      }));

      docs.sort((a, b) => a.path.localeCompare(b.path));
      metas.sort((a, b) => a.path.localeCompare(b.path));
      return { docs, metas };
    },
  };
}
