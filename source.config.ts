import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';
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
// 排序 meta 也留在这里 —— 它用 `../(generated)/charge/createCharge` 直接引用脚本产物,
// 增删 API 时必须与 openapi*.yaml 同步改, 属发版动作而非编辑动作。
// pattern 里的 `(` `)` MUST 写成 `[(]` `[)]`: picomatch 把裸括号当分组, 匹配不到字面量。
export const openapiDocs = defineDocs({
  docs: {
    files: ['openapi/[(]generated[)]/**/*.mdx'],
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

export default defineConfig({
  // (generated)/ 不入 git, `git log` 对它一律返回空 -> 该插件对本集合实际已无产出,
  // 留着只为保住 DocData 的 lastModified 类型槽位; D 组一并清掉。
  plugins: [lastModified()],
  mdxOptions: {
    remarkImageOptions: {
      useImport: false,
    },
  },
});
