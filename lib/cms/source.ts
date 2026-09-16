import { parseFrontmatter } from '@fumadocs/mdx-remote';
import type { DynamicSource, VirtualFile } from 'fumadocs-core/source';
import {
  docFrontmatterSchema,
  docMetaSchema,
  type DocFrontmatter,
  type DocMeta,
} from '@/lib/content-schema';
import { compileDoc, type CompiledDoc } from './mdx';
import type { ContentProvider } from './provider';

/**
 * CMS 页面的数据形状。
 *
 * 只有 frontmatter 是即时可得的; 正文编译推迟到 `load()`, 因为 files() 每次刷新都会
 * 重建全部记录, 在这里编译 630 份 mdx 会让任何一次 revalidate 都卡住整个进程。
 * fumadocs 原生支持这个形状: 搜索索引 (buildIndexDefault) 找不到 structuredData 时
 * 会自动回落到 data.load()。
 */
export type CmsDocData = DocFrontmatter & {
  lastModified?: Date;
  load: () => Promise<CompiledDoc>;
  getText: (type: 'raw' | 'processed') => Promise<string>;
};

// 显式标注 SourceConfig: 不标注的话 VirtualFile 退化成默认泛型, page.data 在消费侧
// 只剩 PageData 的 title / description, 自定义 frontmatter 字段全部丢失类型。
type CmsSourceConfig = { pageData: CmsDocData; metaData: DocMeta };

export function createContentSource(
  provider: ContentProvider,
): DynamicSource<CmsSourceConfig> {
  return {
    async files(): Promise<VirtualFile<CmsSourceConfig>[]> {
      const { docs, metas } = await provider.load();

      const pages = docs.map<VirtualFile<CmsSourceConfig>>((record) => {
        const { frontmatter } = parseFrontmatter(record.source);
        const parsed = docFrontmatterSchema.safeParse(frontmatter);
        if (!parsed.success) {
          throw new Error(
            `[cms] frontmatter 不合法: ${record.path}\n${parsed.error.message}`,
          );
        }

        // 每条记录一份 memo: files() 的结果被 dynamicLoader 缓存到下次 revalidate,
        // 同一页反复访问只编译一次。
        let compiled: Promise<CompiledDoc> | undefined;
        const load = () => (compiled ??= compileDoc(record.source, record.path));

        const data: CmsDocData = {
          ...parsed.data,
          lastModified: record.updatedAt,
          load,
          async getText(type) {
            if (type === 'raw') return record.source;
            return (await load()).processedMarkdown;
          },
        };

        return { type: 'page', path: record.path, data };
      });

      const navigation = metas.map<VirtualFile<CmsSourceConfig>>((record) => {
        const parsed = docMetaSchema.safeParse(record.data);
        if (!parsed.success) {
          throw new Error(
            `[cms] meta 不合法: ${record.path}\n${parsed.error.message}`,
          );
        }
        return { type: 'meta', path: record.path, data: parsed.data };
      });

      return [...pages, ...navigation];
    },
  };
}
