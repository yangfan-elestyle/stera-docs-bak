import type { Node, Root } from 'fumadocs-core/page-tree';
import type { LoaderOutput } from 'fumadocs-core/source';

// 独立于 lib/source.ts: 那边拖着 fumadocs-mdx 构建产物与 next/server, 单测加载不了。
// 只依赖 loader 的公开方法, 对任何 loader 实例 (含测试里手搭的) 都成立。
type AnyLoader = Pick<
  LoaderOutput<any>,
  'getPages' | 'getPageTree' | 'getNodePage'
>;
type AnyPage = ReturnType<AnyLoader['getPages']>[number];

export function isHiddenPage(page: AnyPage): boolean {
  return (page.data as { hidden?: boolean }).hidden === true;
}

/**
 * frontmatter `hidden: true` 的页面只保留直链: 站点出口 (侧边栏 / 首页 / 页脚 / 搜索 /
 * llms*.txt) MUST 走 getSitePages / getSiteTree, MUST NOT 直接用 getPages / getPageTree。
 * 过滤不做成 transformPageTree 插件: 那会连 /admin 树一起剥掉, 编辑者再也找不回这页。
 */
export function getSitePages<S extends AnyLoader>(
  src: S,
  lang?: string,
): ReturnType<S['getPages']> {
  return src
    .getPages(lang)
    .filter((page) => !isHiddenPage(page)) as ReturnType<S['getPages']>;
}

// loader 在下次 revalidate 前是同一个对象, 树也是; 按树 memo, 每次请求不重复过滤
const siteTrees = new WeakMap<Root, Root>();

export function getSiteTree(src: AnyLoader, lang: string): Root {
  const tree = src.getPageTree(lang);
  let filtered = siteTrees.get(tree);
  if (!filtered) {
    filtered = { ...tree, children: filterHidden(src, tree.children, lang) };
    siteTrees.set(tree, filtered);
  }
  return filtered;
}

function filterHidden(src: AnyLoader, nodes: Node[], lang: string): Node[] {
  const hidden = (node: Node) => {
    if (node.type !== 'page') return false;
    const page = src.getNodePage(node, lang);
    return page !== undefined && isHiddenPage(page);
  };

  const out: Node[] = [];
  for (const node of nodes) {
    if (node.type === 'page') {
      if (!hidden(node)) out.push(node);
      continue;
    }
    if (node.type === 'folder') {
      const children = filterHidden(src, node.children, lang);
      const index = node.index && !hidden(node.index) ? node.index : undefined;
      if (children.length === 0 && !index) continue;
      out.push({ ...node, index, children });
      continue;
    }
    out.push(node);
  }
  // 分段下的页面全被隐藏时, 分段标题本身也不再出现
  return out.filter(
    (node, i) =>
      node.type !== 'separator' ||
      (i + 1 < out.length && out[i + 1].type !== 'separator'),
  );
}
