import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { flattenTree, getPageTreeRoots } from 'fumadocs-core/page-tree';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { i18n } from './i18n';
import { openapiPlugin } from 'fumadocs-openapi/server';
import { getRequestOrigin } from '@/lib/request';
import { sectionNotesPlugin } from '@/lib/plugins/section-notes';
import { resolveLLMTags } from './llm-postprocess';
import { getPageUrl } from './url';

export const source = loader({
  i18n,
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  plugins: [
    lucideIconsPlugin(),
    openapiPlugin(),
    sectionNotesPlugin(),
  ],
});

// 页脚 previous/next: 邻居范围限定在当前页所在的 root tab，避免跨 tab 串页
export function getFooterItems(
  page: InferPageType<typeof source>,
  lang: string,
) {
  const tree = source.getPageTree(lang);
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
    const title = source.getNodePage(item, lang)?.data.title;
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

export function getPageImage(page: InferPageType<typeof source>) {
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
export function getPageDescription(
  page: InferPageType<typeof source>,
): string | undefined {
  const explicit = page.data.description?.trim();
  if (explicit) return explicit;

  const contents = (
    page.data as { structuredData?: { contents?: { content?: string }[] } }
  ).structuredData?.contents;
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

export async function getLLMText(
  page: InferPageType<typeof source>,
  host: string,
) {
  const processed = await page.data.getText('processed');
  const resolved = await resolveLLMTags(processed, host, page.url);
  const origin = getRequestOrigin(host);
  const pageHref = getPageUrl(page.url, origin);

  return `# ${page.data.title} (${pageHref})

${resolved}`;
}
