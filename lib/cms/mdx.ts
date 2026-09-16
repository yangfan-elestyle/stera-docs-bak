import { createCompiler } from '@fumadocs/mdx-remote';
import { remarkStructure } from 'fumadocs-core/mdx-plugins';
import {
  remarkLLMs,
  type LLMsOptions,
} from 'fumadocs-core/mdx-plugins/remark-llms';
import type { TOCItemType } from 'fumadocs-core/toc';
import type { Plugin } from 'unified';
import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';
import * as path from 'node:path';

// llms 输出把这些组件降级成占位符, 由 lib/llm-postprocess.ts 在运行期还原成 markdown。
// 名字与 source.config.ts 里给 openapi 集合的那份 MUST 一致。
export const LLMS_OPTIONS: LLMsOptions = {
  mdxAsPlaceholder: [
    'APIPage',
    'Callout',
    'EHome',
    'EMermaid',
    'ErrorCodeTable',
  ],
};

// 运行期编译链 MUST 与构建期 (fumadocs-mdx applyMdxPreset + remarkPostprocess) 逐项对齐,
// 同一份 mdx 走两条路径要产出同样的 body / toc / structuredData / _markdown。
// mdx-remote 的 fumadocs preset 只覆盖 gfm / heading / image / codeTab / npm + rehypeCode / rehypeToc,
// 差的三处在这里补齐:
//   1. remarkHeading 的 generateToc: false —— toc 由 rehypeToc 产出, 不补会多出一份
//   2. remarkStructure —— 页面描述 (getPageDescription) 与搜索索引都读 structuredData,
//      preset 里没有它, 缺了这两处会一起静默失效
//   3. remarkLLMs —— 构建期由 postprocess.includeProcessedMarkdown 挂上, 产出 `_markdown`
const compiler = createCompiler({
  remarkHeadingOptions: { generateToc: false },
  remarkImageOptions: {
    useImport: false,
    publicDir: path.join(process.cwd(), 'public'),
    // 默认是 throw。对 CMS 来说一个写错的图片路径不该让整页 500, 而且后台上传的图
    // 存在持久卷上 (见 lib/cms/uploads.ts), 本来就不在 publicDir 里量不到尺寸。
    // 代价: 这类图片渲染时没有 width/height。站点图片已是 unoptimized, 可以接受。
    onError: (error: Error) => {
      console.warn('[cms] 取图片尺寸失败, 按无尺寸渲染:', error.message);
    },
  },
  remarkPlugins: [
    [remarkStructure, { exportAs: 'structuredData' }],
    processedMarkdown(),
  ],
});

// remarkLLMs MUST 满足两个条件, 与构建期 remarkPostprocess 的调法一致:
//   1. 在 transform 阶段调用, 不是 attach 阶段
//   2. `this` 绑到 processor
// 它内部的 defaultStringifier 读 `this.data('toMarkdownExtensions')` 取 mdast->markdown 扩展,
// remark-gfm 的 table 等就注册在那里, 且要等所有 attacher 跑完才齐。
// 漏掉任一条, 带表格的页面会在运行期抛 `Cannot handle unknown node \`table\``。
type LLMsTransformer = (tree: unknown, file: unknown, next: () => void) => void;
const attachLLMs = remarkLLMs as unknown as (
  this: unknown,
  options: LLMsOptions,
) => LLMsTransformer;

function processedMarkdown(): Plugin<[]> {
  return function () {
    const processor = this;
    return (tree, file) => {
      attachLLMs.call(processor, LLMS_OPTIONS)(tree, file, () => undefined);
    };
  };
}

export interface CompiledDoc {
  body: (props: {
    components?: MDXComponents;
  }) => ReactNode | Promise<ReactNode>;
  toc: TOCItemType[];
  structuredData: unknown;
  /** remarkLLMs 产出的 markdown, 供 llms.txt / <path>.md 一系输出用 */
  processedMarkdown: string;
}

export async function compileDoc(
  source: string,
  filePath: string,
): Promise<CompiledDoc> {
  const result = await compiler.compile({ source, filePath });
  const exports = result.exports ?? {};

  return {
    body: result.body,
    toc: result.toc,
    structuredData: (exports as Record<string, unknown>).structuredData,
    processedMarkdown: String(
      (exports as Record<string, unknown>)._markdown ?? '',
    ),
  };
}
