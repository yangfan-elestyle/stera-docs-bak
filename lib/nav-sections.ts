// 把已过滤的 pageTree 转换为「章节列表」: 按 ---xxx--- separator 分段, 每段下挂 page/folder 链接.
// 给 EHome (React 渲染) 与 llm-postprocess (markdown 渲染) 共用; 任何一方改逻辑都同步生效, 避免拷贝漂移.

export type NavSectionItem = {
  title: string;
  url?: string;
  external?: boolean;
};

export type NavSection = {
  title: string;
  description?: string;
  items: NavSectionItem[];
};

// fumadocs 不为 root:true 文件夹提取 index: 根 page 以 url === root 的子节点存在,
// 反查它所属 folder 即锁定当前 tab 范围. 找不到则回退顶层, 兼容未分组的旧结构.
function findRootTabChildren(tree: any, root: string): any[] {
  const top: any[] = tree?.children ?? [];
  const tabFolder = top.find(
    (n: any) =>
      n?.type === 'folder' &&
      (n?.children ?? []).some(
        (c: any) => c?.type === 'page' && c?.url === root,
      ),
  );
  return tabFolder?.children ?? top;
}

export function buildNavSections(tree: any, root: string): NavSection[] {
  const children = findRootTabChildren(tree, root);

  const sections: NavSection[] = [];
  let current: NavSection | null = null;

  const flush = () => {
    if (current && current.items.length > 0) sections.push(current);
    current = null;
  };

  const startSection = (rawTitle?: string, description?: string) => {
    const title = (rawTitle ?? '').replace(/^---|---$/g, '').trim();
    flush();
    current = { title, description, items: [] };
  };

  const addItem = (title: string, url?: string, external?: boolean) => {
    if (!url || url === root) return;
    (current ??= { title: '', items: [] }).items.push({ title, url, external });
  };

  // folder 不递归; 取 folder 自身的 index, 否则取首个可链接子节点.
  const findFirstLink = (
    nodes?: any[],
  ): { url?: string; external?: boolean } | undefined => {
    if (!nodes) return undefined;
    for (const n of nodes) {
      if (!n) continue;
      if (n.type === 'page') return n;
      if (n.type === 'folder' && n.index) return n.index;
    }
    return undefined;
  };

  for (const node of children) {
    if (!node) continue;
    switch (node.type) {
      case 'separator':
        startSection(
          String(node.name ?? ''),
          node.description ? String(node.description) : undefined,
        );
        break;
      case 'page':
        addItem(String(node.name ?? ''), node.url, Boolean(node.external));
        break;
      case 'folder': {
        const title = String(node?.name ?? '');
        const indexUrl = node.index?.url as string | undefined;
        if (indexUrl) {
          addItem(title, indexUrl, Boolean(node.index?.external));
        } else {
          const first = findFirstLink(node.children);
          if (first) addItem(title, first.url, Boolean(first.external));
        }
        break;
      }
    }
  }

  flush();
  return sections;
}
