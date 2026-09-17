import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import type { LLMsOptions } from 'fumadocs-core/mdx-plugins/remark-llms';
import { docFrontmatterSchema, docMetaSchema } from './lib/content-schema';

const llmsOptions: LLMsOptions = {
  mdxAsPlaceholder: [
    'APIPage',
    'Callout',
    'EHome',
    'EMermaid',
    'ErrorCodeTable',
  ],
};

// 构建期集合只剩 openapi 一份: 手写内容已移到 seed/docs, 由 lib/cms 在运行期编译。
//
// API Reference 这一整块都是构建期产物, 改动一律走发版, MUST NOT 进 CMS:
//   - (generated)/ 153 页由 openapi*.yaml 生成, 手改会被下次 generate:data 覆盖
//   - index*.mdx 3 页是它的概要页, 正文只有一个 <EHome />
//   - 排序 meta 用 `../(generated)/charge/createCharge` 直接引用脚本产物,
//     增删 API 时必须与 yaml 同步改
// pattern 里的 `(` `)` MUST 写成 `[(]` `[)]`: picomatch 把裸括号当分组, 匹配不到字面量。
export const openapiDocs = defineDocs({
  docs: {
    files: ['openapi/[(]generated[)]/**/*.mdx', 'openapi/index*.mdx'],
    schema: docFrontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: llmsOptions,
    },
  },
  meta: {
    files: ['openapi/meta*.json', 'openapi/*/meta*.json'],
    schema: docMetaSchema,
  },
});

// 无 plugins: 原来的 lastModified() 按文件跑 `git log`, 是全仓唯一的构建期 git 依赖。
// 构建期集合现在只剩 (generated)/, 它不入 git, git log 一律返回空 -> 插件已无产出。
// 手写页的最終更新日改由内容源自带 (seed/updated-at.json, 入库后为 DB 的 updated_at)。
export default defineConfig({
  mdxOptions: {
    remarkImageOptions: {
      useImport: false,
    },
  },
});
