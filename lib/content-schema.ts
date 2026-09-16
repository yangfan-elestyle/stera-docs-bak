import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

// 构建期 (source.config.ts) 与运行期 (lib/cms) 共用同一份 schema。
// mdx-remote 的 compile() 不校验 frontmatter, 两边各写一份必然静默漂移。
export const docFrontmatterSchema = pageSchema.extend({
  tocMaxDepth: z.number().int().positive().optional(),
  redirect: z.string().optional(),
});

// sectionNotes 是非标准字段: sidebar 分隔符的描述文案靠它注入 (lib/plugins/section-notes.ts)。
export const docMetaSchema = metaSchema.extend({
  sectionNotes: z.record(z.string(), z.string()).optional(),
});

export type DocFrontmatter = z.infer<typeof docFrontmatterSchema>;
export type DocMeta = z.infer<typeof docMetaSchema>;
