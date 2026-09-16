import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';
import type { LLMsOptions } from 'fumadocs-core/mdx-plugins/remark-llms';
import { z } from 'zod';

// Extend frontmatter schema to support custom TOC max depth and redirect

const customFrontmatterSchema = frontmatterSchema.extend({
  tocMaxDepth: z.number().int().positive().optional(),
  redirect: z.string().optional(),
});

const customMetaSchema = metaSchema.extend({
  sectionNotes: z.record(z.string(), z.string()).optional(),
});

const llmsOptions: LLMsOptions = {
  mdxAsPlaceholder: [
    'APIPage',
    'Callout',
    'EHome',
    'EMermaid',
    'ErrorCodeTable',
  ],
};

// content/docs 下两类内容生命周期不同, 拆成两个 collection:
//   openapiDocs = openapi*.yaml 的脚本产物 + 排序用 meta, 永远构建期编译
//   docs        = 手写内容, 后续整体迁入 CMS 运行时数据源
//
// pattern 两个坑 (已实测 picomatch 4 / tinyglobby 0.2):
//   1. `(` `)` 被当作分组, route group 目录必须写成 `[(]home[)]` 才匹配得到字面量
//   2. 数组里的 `!pattern` 不做减法, 只是「匹配其余一切」-> 只用正向 pattern
// 两组 pattern MUST 互斥且并集 = content/docs 全量, 否则文件会漏进 / 重复进页面树。
const GENERATED = 'openapi/[(]generated[)]';
const HOME = '[(]home[)]';

export const docs = defineDocs({
  docs: {
    files: [`${HOME}/**/*.mdx`, 'openapi/index*.mdx'],
    schema: customFrontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: llmsOptions,
    },
  },
  meta: {
    files: ['meta*.json', `${HOME}/**/meta*.json`],
    schema: customMetaSchema,
  },
});

// 排序 meta 留在构建期: 它用 `../(generated)/charge/createCharge` 直接引用脚本产物,
// 增删 API 时必须与 openapi*.yaml 同步改, 属发版动作而非编辑动作。
export const openapiDocs = defineDocs({
  docs: {
    files: [`${GENERATED}/**/*.mdx`],
    schema: customFrontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: llmsOptions,
    },
  },
  meta: {
    files: ['openapi/meta*.json', 'openapi/*/meta*.json'],
    schema: customMetaSchema,
  },
});

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkImageOptions: {
      useImport: false,
    },
  },
});
