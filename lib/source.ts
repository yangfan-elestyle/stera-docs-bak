import { openapiDocs } from 'fumadocs-mdx:collections/server';
import { dynamicLoader } from 'fumadocs-core/source/dynamic';
import { createContentSource } from '@/lib/cms/source';
import { createDbProvider } from '@/lib/cms/db-provider';
import { contentVersion } from '@/lib/cms/version';
import type { CompiledDoc } from '@/lib/cms/mdx';
import {
  flattenTree,
  getPageTreeRoots,
  type Root,
} from 'fumadocs-core/page-tree';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { i18n } from './i18n';
import { openapiPlugin } from 'fumadocs-openapi/server';
import { getRequestOrigin } from '@/lib/request';
import { sectionNotesPlugin } from '@/lib/plugins/section-notes';
import { resolveLLMTags } from './llm-postprocess';
import { getPageUrl } from './url';

// docs 是动态源 (运行期编译), openapi 是静态源 (构建期编译), dynamicLoader 原生支持混用。
// 两者合并进同一份 storage: openapi 排序 meta 里的 `../(generated)/...` 与
// `openapi/meta.json` 里的 `index` 都是跨 source 引用, 靠这份合并 storage 才解析得到。
// 换数据源只需替换下面的 provider, 消费侧的 `await getSource()` 不动。
export const source = dynamicLoader(
  {
    docs: createContentSource(createDbProvider()),
    openapi: openapiDocs.toFumadocsSource(),
  },
  {
    i18n,
    baseUrl: '/',
    plugins: [lucideIconsPlugin(), openapiPlugin(), sectionNotesPlugin()],
  },
);

export type DocsSource = Awaited<ReturnType<typeof source.get>>;
export type DocsPage = typeof source.$inferPage;

let seenVersion: string | undefined;

/**
 * 取 loader 的唯一入口。消费侧 MUST 走这里, MUST NOT 直接调 `source.get()`。
 *
 * dynamicLoader 的失效状态是模块级变量, 而 Next 给 page 与 route handler 打的是不同的
 * 入口 bundle —— 保存动作里调的 `revalidate()` 到不了 route handler 那份模块实例,
 * 表现为「页面已更新但 .md / llms.txt 还是旧的」。实测生产构建下确实如此。
 * 所以改成每次都跟库里的版本指纹对一下, 变了就本实例自己失效一次。
 * 代价是一条 max+count 查询, 相对一次编译可以忽略。
 */
export async function getSource(): Promise<DocsSource> {
  const version = contentVersion();
  if (seenVersion !== version) {
    source.revalidate('docs');
    seenVersion = version;
  }
  return source.get();
}

/**
 * 取正文 / TOC / structuredData。
 *
 * 两类页面数据形状不同: openapi 生成页在构建期就把三者写进 data, CMS 页只带 frontmatter,
 * 正文编译推迟到 `load()`。消费侧 MUST 走这里, MUST NOT 直接读 `page.data.body`
 * —— CMS 页上那个字段不存在, 且不会报错, 只会渲染出空白正文。
 */
export async function loadDoc(page: DocsPage): Promise<CompiledDoc> {
  const data = page.data as Record<string, unknown>;
  if (typeof data.load === 'function') {
    return (await (
      data.load as () => Promise<CompiledDoc>
    )()) satisfies CompiledDoc;
  }
  return data as unknown as CompiledDoc;
}

// 页脚 previous/next: 邻居范围限定在当前页所在的 root tab，避免跨 tab 串页
export function getFooterItems(src: DocsSource, page: DocsPage, lang: string) {
  const tree = src.getPageTree(lang);
  if (!tree) return {};

  // 如 (home) 末页 → openapi 首页
  const ownRoot = getPageTreeRoots(tree).find((root) =>
    flattenTree(root.children).some((p) => p.url === page.url),
  );
  if (!ownRoot) return {};

  const allPages = flattenTree(ownRoot.children);
  const currentIndex = allPages.findIndex((p) => p.url === page.url);
  if (currentIndex === -1) return {};

  // page.data.title 来自 mdx frontmatter (生成产物含 schema 校验, 必有非空 title);
  // item.name 来自 meta.json / 自动派生, 兜底用. 无第三层是有意为之.
  const getFooterTitle = (item: (typeof allPages)[number]) => {
    const title = src.getNodePage(item, lang)?.data.title;
    if (typeof title === 'string' && title.length > 0) return title;
    return typeof item.name === 'string' ? item.name : '';
  };

  const toItem = (item: (typeof allPages)[number] | undefined) =>
    item ? { name: getFooterTitle(item), url: item.url } : undefined;

  return {
    previous: toItem(allPages[currentIndex - 1]),
    next: toItem(allPages[currentIndex + 1]),
  };
}

// 最終更新日只有手写页有: 它来自内容源 (seed/updated-at.json, 入库后是 DB 的 updated_at)。
// openapi 生成页是脚本产物且不入 git, 没有这个概念, 页面上不显示。
export function getLastModified(page: DocsPage): Date | undefined {
  return (page.data as { lastModified?: Date }).lastModified;
}

export function getPageImage(page: DocsPage) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/${segments.join('/')}`,
  };
}

const DESCRIPTION_MAX = 155;

// CJK 字符类(含和文/中日韩统一/全角及标点),用于清除被剥离行内组件留下的空隙。
const CJK = '\\u3000-\\u303f\\u3040-\\u30ff\\u3400-\\u9fff\\uff00-\\uffef';
const CJK_GAP = new RegExp(`([${CJK}])\\s+(?=[${CJK}])`, 'g');

/**
 * 清洗 structuredData 抽取的正文文本为可读纯文本:
 * structuredData 已排除代码块/EMermaid,但会保留 `**`/行内代码标记,且会丢弃行内 JSX
 * 留下空隙。此处剥离残留标记并修复空格。不动 `_`,避免误伤 snake_case。
 */
function normalizeDescriptionText(raw: string): string {
  return raw
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接/图片 → 可读文本
    .replace(/[*`]+/g, '') // 去除加粗/斜体/行内代码标记
    .replace(/\s+/g, ' ') // 折叠空白
    .replace(CJK_GAP, '$1') // 去除 CJK 之间的残留空格
    .trim();
}

/**
 * 页面描述,带自动回退(无需为每个 mdx 手写 description):
 *   1. frontmatter.description(若显式声明)
 *   2. 正文首段(由 structuredData 提供),清洗后截断至 ~155 字符
 *   3. undefined(交由调用方决定是否省略)
 * 用于 SEO meta 与 OG 预览图。
 */
export async function getPageDescription(
  page: DocsPage,
): Promise<string | undefined> {
  const explicit = page.data.description?.trim();
  if (explicit) return explicit;

  const { structuredData } = await loadDoc(page);
  const contents = (structuredData as { contents?: { content?: string }[] })
    ?.contents;
  if (!contents?.length) return undefined;

  // 多取一些原始文本,清洗(可能缩短)后再截断。
  let text = '';
  for (const { content } of contents) {
    const para = content?.trim();
    if (!para) continue;
    text = text ? `${text} ${para}` : para;
    if (text.length >= DESCRIPTION_MAX * 2) break;
  }

  text = normalizeDescriptionText(text);
  if (!text) return undefined;

  return text.length > DESCRIPTION_MAX
    ? `${text.slice(0, DESCRIPTION_MAX).trimEnd()}…`
    : text;
}

export async function getLLMText(page: DocsPage, host: string, pageTree: Root) {
  const processed = await page.data.getText('processed');
  const resolved = await resolveLLMTags(processed, host, pageTree, page.url);
  const origin = getRequestOrigin(host);
  const pageHref = getPageUrl(page.url, origin);

  return `# ${page.data.title} (${pageHref})

${resolved}`;
}
