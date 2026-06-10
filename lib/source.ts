import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import {
  findPath,
  flattenTree,
  getPageTreeRoots,
} from 'fumadocs-core/page-tree';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { i18n } from './i18n';
import { openapiPlugin } from 'fumadocs-openapi/server';
import { detectTenantByHost, getRequestOrigin } from '@/lib/tenant';
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

// 根据租户（由 host 推断）判断页面是否可见，防止用户通过直接访问 url 进入不可见页面
export function isPageVisibleForHost(
  page: InferPageType<typeof source>,
  lang: string,
  host: string,
) {
  // 1. check file schema
  const pageVisible = getExplicitVisibleTenants(page.data as any);
  if (pageVisible !== undefined) return isHostMatch(host, pageVisible);

  // 2. check meta.json in the same folder
  const tree = source.getPageTree(lang);
  const path = findPath(
    tree.children,
    (node: any) => node.type === 'page' && node.url === page.url,
    { includeSeparator: false },
  );
  if (path) {
    for (let i = path.length - 1; i >= 0; i--) {
      const node = path[i];
      if (node.type === 'folder') {
        const meta = source.getNodeMeta(node, lang);
        const visible = getExplicitVisibleTenants(meta?.data as any);
        if (visible !== undefined) return isHostMatch(host, visible);
      }
    }
  }

  // 3. default to visible
  return true;
}

// 根据租户（由 host 推断）过滤 nav 页面，防止用户通过侧边栏访问不可见页面
export function getFilteredTreeByHost(lang: string, host: string) {
  const root = source.pageTree[lang];
  if (!root) return root as any;

  /**
   * check page/folder/separator visibility
   */
  function filterChildren(children: any[], inheritedVisible?: string[]): any[] {
    const filtered: any[] = [];

    for (const child of children) {
      if (child.type === 'page') {
        // 1. if page, directly check visibility
        const entry = source.getPageByHref(child.url, { language: lang });
        const visible = getExplicitVisibleTenants(entry?.page?.data as any);
        if (isHostMatch(host, visible ?? inheritedVisible)) {
          filtered.push(child);
        }
      } else if (child.type === 'folder') {
        // 2. if folder, recursively filter - use `filterFolder`
        const result = filterFolder(child, inheritedVisible);
        if (result) filtered.push(result);
      } else if (child.type === 'separator') {
        // 3. if separator, wait `cleanupSeparators`
        filtered.push(child);
      }
    }

    return cleanupSeparators(filtered);
  }

  /**
   * Filter a folder node recursively.
   */
  function filterFolder(
    node: any,
    inheritedVisible?: string[],
  ): any | undefined {
    const meta = source.getNodeMeta(node, lang);
    const folderVisible = getExplicitVisibleTenants(meta?.data as any);
    const currentVisible =
      folderVisible !== undefined ? folderVisible : inheritedVisible;

    const next: any = { ...node };

    if (next.index) {
      const idxEntry = source.getPageByHref(next.index.url, { language: lang });
      const idxVisible = getExplicitVisibleTenants(idxEntry?.page?.data as any);
      if (!isHostMatch(host, idxVisible ?? currentVisible)) {
        next.index = undefined;
      }
    }

    next.children = filterChildren(node.children, currentVisible);

    // 三态合一:
    //   - 仍有可见子项                 → 保留为 folder
    //   - 子项全被过滤但 index 仍可见   → 降级为 page 节点 (避免空 dropdown)
    //   - 子项与 index 均不可见        → 丢弃
    return next.children.length > 0
      ? next
      : next.index
        ? {
            ...next.index,
            name: next.name ?? next.index.name,
            icon: next.icon ?? next.index.icon,
          }
        : undefined;
  }

  // Filter root and fallback
  const nextRoot: any = {
    ...root,
    children: filterChildren(root.children),
  };

  // 不同语言的 fallback 也需要过滤，比如当前 fallback 是日语
  if (root.fallback) {
    nextRoot.fallback = {
      ...root.fallback,
      children: filterChildren(root.fallback.children),
    };
  }

  return nextRoot;
}

// 根据租户（由 host 推断）过滤 footer 导航项，防止 fomadocs 自身的 previous/next 出现死链
export function getFilteredFooterItems(
  page: InferPageType<typeof source>,
  lang: string,
  host: string,
) {
  const tree = source.getPageTree(lang);
  if (!tree) return {};

  // 邻居范围限定在当前页所在的 root tab，避免跨 tab 串页（如 (home) 末页 → openapi 首页）
  const ownRoot = getPageTreeRoots(tree).find((root) =>
    flattenTree(root.children).some((p) => p.url === page.url),
  );
  if (!ownRoot) return {};

  const allPages = flattenTree(ownRoot.children);
  const currentIndex = allPages.findIndex((p) => p.url === page.url);
  if (currentIndex === -1) return {};

  const checkVisible = (item: (typeof allPages)[number]) => {
    const entry = source.getPageByHref(item.url, { language: lang });
    if (!entry) return false;
    return isPageVisibleForHost(entry.page, lang, host);
  };

  // page.data.title 来自 mdx frontmatter (生成产物含 schema 校验, 必有非空 title);
  // item.name 来自 meta.json / 自动派生, 兜底用. 无第三层是有意为之.
  const getFooterTitle = (item: (typeof allPages)[number]) => {
    const title = source.getNodePage(item, lang)?.data.title;
    if (typeof title === 'string' && title.length > 0) return title;
    return typeof item.name === 'string' ? item.name : '';
  };

  let previous: { name: string; url: string } | undefined;
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (checkVisible(allPages[i])) {
      previous = {
        name: getFooterTitle(allPages[i]),
        url: allPages[i].url,
      };
      break;
    }
  }

  let next: { name: string; url: string } | undefined;
  for (let i = currentIndex + 1; i < allPages.length; i++) {
    if (checkVisible(allPages[i])) {
      next = {
        name: getFooterTitle(allPages[i]),
        url: allPages[i].url,
      };
      break;
    }
  }

  return { previous, next };
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
 * (如 <EText/>)留下空隙。此处剥离残留标记并修复空格。不动 `_`,避免误伤 snake_case。
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

// ---------- Tenant visibility helpers ----------

// 从 schema 读取显式租户白名单
function getExplicitVisibleTenants(data: any): string[] | undefined {
  if (!data) return undefined;
  return Object.prototype.hasOwnProperty.call(data, 'visibleOnTenant')
    ? data.visibleOnTenant
    : undefined;
}

/**
 * 判断当前 host 对应的租户是否在白名单中。
 * - undefined: 对所有租户可见
 * - []: 对所有租户可见
 * - [...tenants]: 仅当解析得到的租户包含在列表中可见
 */
function isHostMatch(host: string, visible?: string[]): boolean {
  if (!visible || visible.length === 0) return true;
  const tenant = detectTenantByHost(host).toLowerCase();
  return visible.map((v) => String(v).toLowerCase()).includes(tenant);
}

/**
 * 清理导航树中的孤立分隔符。
 * 使用延迟提交策略：只有当分隔符后面有实际内容时才会添加该分隔符。
 */
function cleanupSeparators(children: any[]): any[] {
  const result: any[] = [];
  let buffer: any[] = [];
  let pendingSeparator: any | null = null;

  const flush = () => {
    if (buffer.length > 0) {
      if (pendingSeparator) result.push(pendingSeparator);
      result.push(...buffer);
      buffer = [];
    }
    pendingSeparator = null;
  };

  for (const child of children) {
    if (child.type === 'separator') {
      flush();
      pendingSeparator = child;
    } else {
      buffer.push(child);
    }
  }
  flush();

  return result;
}
