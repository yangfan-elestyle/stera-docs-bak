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

function convert(nodes: Node[], prefix: string): AdminTreeNode[] {
  return nodes.map((node, index) => {
    const id = `${prefix}/${index}`;
    if (node.type === 'separator') {
      return {
        id,
        type: 'separator',
        name: text(node.name).replace(/^-+|-+$/g, ''),
        description:
          text((node as { description?: unknown }).description) || undefined,
      };
    }
    if (node.type === 'folder') {
      return {
        id,
        type: 'folder',
        name: text(node.name),
        description: text(node.description) || undefined,
        dir: dirOf(node.$ref),
        indexSlug: slugOf(node.index?.$ref),
        children: convert(node.children, id),
      };
    }
    return {
      id,
      type: 'page',
      name: text(node.name),
      slug: slugOf(node.$ref),
      url: node.url,
    };
  });
}

/**
 * 后台左侧那棵树直接由站点的 pageTree 转换而来, 而不是另拼一套 —— 编辑者看到的
 * 层级、排序、分段说明与线上侧边栏逐节点一致, 否则「像在操作真实预览」就不成立。
 */
export async function buildAdminTree(): Promise<AdminTree> {
  const src = await getSource();
  const trees: Record<string, AdminTreeNode[]> = {};

  for (const locale of i18n.languages) {
    const root = src.getPageTree(locale) as Root | undefined;
    trees[locale] = root ? convert(root.children, locale) : [];
  }

  const locales: Record<string, string[]> = {};
  const titles: Record<string, Record<string, string>> = {};
  for (const entry of listSlugs()) {
    locales[entry.slug] = entry.locales;
    titles[entry.slug] = entry.titles;
  }

  return { trees, locales, titles };
}
