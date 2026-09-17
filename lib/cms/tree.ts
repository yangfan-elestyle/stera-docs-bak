import type { Node, Root } from 'fumadocs-core/page-tree';
import { getSource } from '@/lib/source';
import { i18n } from '@/lib/i18n';
import { listSlugs } from './content';

export interface AdminTreeNode {
  id: string;
  type: 'page' | 'folder' | 'separator';
  name: string;
  /** separator 的分段说明 (meta.sectionNotes), 以及 folder 的描述 */
  description?: string;
  /** page: CMS slug */
  slug?: string;
  /** page: 站点公开 URL */
  url?: string;
  /** folder: 对应的 meta 目录, 没有自己的 meta 时为 undefined */
  dir?: string;
  /** folder 自身的 index 页 */
  indexSlug?: string;
  children?: AdminTreeNode[];
}

export interface AdminTree {
  /** 每种语言一棵, 与站点侧边栏逐节点一致 */
  trees: Record<string, AdminTreeNode[]>;
  /** 顶层被拆掉的那个唯一分组的 meta 目录, 它的排序与分段说明改由树头部入口编辑 */
  rootDir?: string;
  /** slug -> 已存在的语言, 树上标缺失用 */
  locales: Record<string, string[]>;
  /** slug -> 默认语言标题, 搜索用 */
  titles: Record<string, Record<string, string>>;
}

function text(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(text).join('');
  if (value && typeof value === 'object' && 'props' in value) {
    return text((value as { props?: { children?: unknown } }).props?.children);
  }
  return '';
}

/** `(home)/get-started/set-up.mdx` -> `(home)/get-started/set-up` */
function slugOf(ref: string | undefined): string | undefined {
  return ref?.replace(/\.mdx$/, '');
}

/** `(home)/meta.json` -> `(home)`; 根目录的 `meta.json` -> `` */
function dirOf(ref: string | undefined): string | undefined {
  if (!ref) return undefined;
  const slash = ref.lastIndexOf('/');
  return slash === -1 ? '' : ref.slice(0, slash);
}

/**
 * 站点页面树 -> 后台可编辑树。
 *
 * 构建期内容 MUST 在这里被剔掉: openapi*.yaml 生成的 153 页与它们的排序 meta 改动
 * 走发版, 不该出现在编辑器里 —— 露出来点进去只会是一个查不到 slug 的死链。
 * 判定依据是「在不在 docs 表里」, 不是路径前缀, 免得以后加别的构建期来源时漏判。
 */
function convert(
  nodes: Node[],
  prefix: string,
  editable: Set<string>,
): AdminTreeNode[] {
  const out: AdminTreeNode[] = [];

  for (const [index, node] of nodes.entries()) {
    const id = `${prefix}/${index}`;

    if (node.type === 'separator') {
      out.push({
        id,
        type: 'separator',
        name: text(node.name).replace(/^-+|-+$/g, ''),
        description:
          text((node as { description?: unknown }).description) || undefined,
      });
      continue;
    }

    if (node.type === 'folder') {
      const children = convert(node.children, id, editable);
      const indexSlug = slugOf(node.index?.$ref);
      const keepIndex = indexSlug !== undefined && editable.has(indexSlug);
      // 整组都是构建期内容时, 文件夹本身也不再出现
      if (children.length === 0 && !keepIndex) continue;
      out.push({
        id,
        type: 'folder',
        name: text(node.name),
        description: text(node.description) || undefined,
        dir: dirOf(node.$ref),
        indexSlug: keepIndex ? indexSlug : undefined,
        children,
      });
      continue;
    }

    const slug = slugOf(node.$ref);
    if (slug === undefined || !editable.has(slug)) continue;
    out.push({ id, type: 'page', name: text(node.name), slug, url: node.url });
  }

  return dropEmptySeparators(out);
}

/** 过滤后可能留下「下面一条都没有」的分段标题, 去掉 */
function dropEmptySeparators(nodes: AdminTreeNode[]): AdminTreeNode[] {
  return nodes.filter((node, index) => {
    if (node.type !== 'separator') return true;
    return nodes.slice(index + 1).some((item) => item.type !== 'separator');
  });
}

/**
 * 后台左侧那棵树直接由站点的 pageTree 转换而来, 而不是另拼一套 —— 编辑者看到的
 * 层级、排序、分段说明与线上侧边栏逐节点一致, 否则「像在操作真实预览」就不成立。
 */
export async function buildAdminTree(): Promise<AdminTree> {
  const src = await getSource();

  const locales: Record<string, string[]> = {};
  const titles: Record<string, Record<string, string>> = {};
  for (const entry of listSlugs()) {
    locales[entry.slug] = entry.locales;
    titles[entry.slug] = entry.titles;
  }
  // docs 表里有 = CMS 内容; 其余都是构建期产物, 不进这棵树
  const editable = new Set(Object.keys(locales));

  const trees: Record<string, AdminTreeNode[]> = {};
  let rootDir: string | undefined;
  for (const locale of i18n.languages) {
    const root = src.getPageTree(locale) as Root | undefined;
    const nodes = root ? convert(root.children, locale, editable) : [];
    // 过滤完只剩一个顶层分组时把它拆开: 全站可编辑内容都在它下面, 多一层只是白占缩进。
    // 它自身的排序与分段说明由树头部的入口编辑, 能力不丢。
    if (nodes.length === 1 && nodes[0].type === 'folder') {
      rootDir ??= nodes[0].dir;
      trees[locale] = nodes[0].children ?? [];
    } else {
      trees[locale] = nodes;
    }
  }

  return { trees, rootDir, locales, titles };
}
