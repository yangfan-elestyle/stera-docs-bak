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

      const pages: VirtualFile<CmsSourceConfig>[] = [];
      for (const record of docs) {
        const { frontmatter } = parseFrontmatter(record.source);
        const parsed = docFrontmatterSchema.safeParse(frontmatter);
        if (!parsed.success) {
          // 跳过而非抛错: dynamicLoader 会把 files() 的 rejected promise 一直缓存到
          // 下次 revalidate(), 一条坏数据抛出来等于整站持续 500 且只能靠再写一次库恢复。
          // 真正的拦截点在写入侧 —— 保存时用同一份 schema 校验并拒绝。
          console.error(
            `[cms] 跳过 frontmatter 不合法的页面 ${record.path}:`,
            parsed.error.issues,
          );
          continue;
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

        pages.push({ type: 'page', path: record.path, data });
      }

      const navigation: VirtualFile<CmsSourceConfig>[] = [];
      for (const record of metas) {
        const parsed = docMetaSchema.safeParse(record.data);
        if (!parsed.success) {
          console.error(
            `[cms] 跳过不合法的 meta ${record.path}:`,
            parsed.error.issues,
          );
          continue;
        }
        navigation.push({ type: 'meta', path: record.path, data: parsed.data });
      }

      return [...pages, ...navigation];
    },
  };
}
