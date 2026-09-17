'use client';

import {
  ChevronRight,
  ExternalLink,
  FileText,
  Folder as FolderIcon,
  Lock,
  Search,
  Settings2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AdminTreeNode } from '@/lib/cms/tree';
import { cn } from '@/lib/admin/cn';
import { Button } from '../ui/button';
import { Tooltip } from '../ui/primitives';

export interface TreeSelection {
  kind: 'doc' | 'nav';
  /** doc: slug; nav: meta 目录 */
  key: string;
}

export function ContentTree({
  nodes,
  locales,
  navDirs,
  rootDir,
  languages,
  locale,
  onLocaleChange,
  selection,
  onSelect,
  headerAction,
}: {
  nodes: AdminTreeNode[];
  /** slug -> 已存在语言。只有在这里的 slug 才是 CMS 内容, 其余是构建期产物 */
  locales: Record<string, string[]>;
  /** 可编辑的导航目录。openapi 的排序 meta 留在构建期, 不在其中 */
  navDirs: string[];
  /** 顶层被拆掉的那个分组, 它的排序入口挪到这里 */
  rootDir?: string;
  languages: string[];
  locale: string;
  onLocaleChange: (locale: string) => void;
  selection?: TreeSelection;
  onSelect: (selection: TreeSelection) => void;
  headerAction?: React.ReactNode;
}) {
  const [query, setQuery] = useState('');
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const scroller = useRef<HTMLDivElement>(null);

  // 当前编辑的那一项要自动滚进视野, 否则树一长就看不出「我在哪」
  const activeKey = selection ? `${selection.kind}:${selection.key}` : '';
  useEffect(() => {
    if (!activeKey) return;
    scroller.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeKey]);

  const filtered = useMemo(
    () =>
      filterTree(
        nodes,
        query.trim().toLowerCase(),
        onlyIncomplete,
        locales,
        languages.length,
      ),
    [nodes, query, onlyIncomplete, locales, languages.length],
  );

  const incomplete = Object.values(locales).filter(
    (list) => list.length !== languages.length,
  ).length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2 border-b border-fd-border p-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-0.5 rounded-lg bg-fd-muted p-0.5">
            {languages.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onLocaleChange(item)}
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
                  locale === item
                    ? 'bg-fd-card text-fd-foreground shadow-sm'
                    : 'text-fd-muted-foreground hover:text-fd-foreground',
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-0.5">
            {rootDir !== undefined && navDirs.includes(rootDir) ? (
              <Tooltip content="编辑整体排序与分段说明">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="编辑整体排序"
                  className={
                    selection?.kind === 'nav' && selection.key === rootDir
                      ? 'bg-fd-primary/10 text-fd-primary'
                      : undefined
                  }
                  onClick={() => onSelect({ kind: 'nav', key: rootDir })}
                >
                  <Settings2 className="size-3.5" />
                </Button>
              </Tooltip>
            ) : null}
            {headerAction}
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-fd-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索页面…"
            className="h-8 w-full rounded-lg border border-fd-border bg-fd-card pl-8 pr-7 text-xs outline-none transition-[box-shadow,border-color] placeholder:text-fd-muted-foreground focus-visible:border-fd-primary focus-visible:ring-2 focus-visible:ring-fd-primary/20"
          />
          {query ? (
            <button
              type="button"
              aria-label="清空"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-fd-muted-foreground hover:text-fd-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setOnlyIncomplete((prev) => !prev)}
          className={cn(
            'flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-[11px] transition-colors',
            onlyIncomplete
              ? 'bg-amber-500/12 text-amber-700 dark:text-amber-400'
              : 'text-fd-muted-foreground hover:bg-fd-accent',
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              incomplete > 0 ? 'bg-amber-500' : 'bg-emerald-500',
            )}
          />
          只看缺语言的页面 ({incomplete})
        </button>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-fd-muted-foreground">
            没有匹配的页面
          </p>
        ) : (
          <TreeNodes
            nodes={filtered}
            depth={0}
            locales={locales}
            navDirs={navDirs}
            languages={languages}
            selection={selection}
            onSelect={onSelect}
            collapsed={collapsed}
            onToggle={(id) =>
              setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
            }
            forceOpen={query.length > 0 || onlyIncomplete}
          />
        )}
      </div>
    </div>
  );
}

function TreeNodes({
  nodes,
  depth,
  locales,
  navDirs,
  languages,
  selection,
  onSelect,
  collapsed,
  onToggle,
  forceOpen,
}: {
  nodes: AdminTreeNode[];
  depth: number;
  locales: Record<string, string[]>;
  navDirs: string[];
  languages: string[];
  selection?: TreeSelection;
  onSelect: (selection: TreeSelection) => void;
  collapsed: Record<string, boolean>;
  onToggle: (id: string) => void;
  forceOpen: boolean;
}) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => {
        const pad = { paddingLeft: `${depth * 12 + 6}px` };

        if (node.type === 'separator') {
          return (
            <li key={node.id} className="pt-3 first:pt-1" style={pad}>
              <p className="px-1.5 text-[11px] font-semibold uppercase tracking-wide text-fd-muted-foreground">
                {node.name}
              </p>
              {node.description ? (
                <p className="line-clamp-2 px-1.5 pt-0.5 text-[11px] text-fd-muted-foreground/70">
                  {node.description}
                </p>
              ) : null}
            </li>
          );
        }

        if (node.type === 'folder') {
          const open = forceOpen || !collapsed[node.id];
          const navActive =
            selection?.kind === 'nav' && selection.key === node.dir;
          return (
            <li key={node.id}>
              <div
                style={pad}
                data-active={navActive || undefined}
                className={cn(
                  'group flex items-center gap-1 rounded-md pr-1 transition-colors',
                  navActive ? 'bg-fd-primary/10' : 'hover:bg-fd-accent',
                )}
              >
                <button
                  type="button"
                  onClick={() => onToggle(node.id)}
                  aria-label={open ? '收起' : '展开'}
                  className="grid size-5 shrink-0 place-items-center text-fd-muted-foreground"
                >
                  <ChevronRight
                    className={cn(
                      'size-3.5 transition-transform',
                      open && 'rotate-90',
                    )}
                  />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    node.indexSlug
                      ? onSelect({ kind: 'doc', key: node.indexSlug })
                      : onToggle(node.id)
                  }
                  className="flex min-w-0 flex-1 items-center gap-1.5 py-1 text-left text-[13px]"
                >
                  <FolderIcon className="size-3.5 shrink-0 text-fd-muted-foreground" />
                  <span className="truncate font-medium">{node.name}</span>
                </button>
                {node.dir !== undefined && navDirs.includes(node.dir) ? (
                  <Tooltip content="编辑这一组的排序与分段说明">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="编辑分组"
                      className={cn(
                        'size-6 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
                        navActive && 'opacity-100',
                      )}
                      onClick={() => onSelect({ kind: 'nav', key: node.dir! })}
                    >
                      <Settings2 className="size-3" />
                    </Button>
                  </Tooltip>
                ) : null}
              </div>
              {open && node.children?.length ? (
                <TreeNodes
                  nodes={node.children}
                  depth={depth + 1}
                  locales={locales}
                  navDirs={navDirs}
                  languages={languages}
                  selection={selection}
                  onSelect={onSelect}
                  collapsed={collapsed}
                  onToggle={onToggle}
                  forceOpen={forceOpen}
                />
              ) : null}
            </li>
          );
        }

        // 不在 locales 里 = 不在 docs 表里 = 构建期产物 (openapi*.yaml 生成的 153 页)。
        // 这类节点 MUST NOT 链到编辑器 —— 编辑器按 slug 查库, 查不到就是 404。
        const editable = node.slug !== undefined && node.slug in locales;
        const has = node.slug ? locales[node.slug] ?? [] : [];
        const missing = languages.filter((lang) => !has.includes(lang));
        const active =
          editable && selection?.kind === 'doc' && selection.key === node.slug;

        if (!editable) {
          return (
            <li key={node.id}>
              <Tooltip content="由 openapi*.yaml 生成, 改动走发版; 点击在站点打开">
                <a
                  href={node.url ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  style={pad}
                  className="group flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left text-[13px] text-fd-muted-foreground/70 transition-colors hover:bg-fd-accent hover:text-fd-muted-foreground"
                >
                  <span className="grid size-5 shrink-0 place-items-center">
                    <Lock className="size-3" />
                  </span>
                  <span className="truncate">{node.name}</span>
                  <ExternalLink className="ml-auto size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </Tooltip>
            </li>
          );
        }

        return (
          <li key={node.id}>
            <button
              type="button"
              style={pad}
              data-active={active || undefined}
              onClick={() =>
                node.slug && onSelect({ kind: 'doc', key: node.slug })
              }
              className={cn(
                'flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left text-[13px] transition-colors',
                active
                  ? 'bg-fd-primary/10 font-medium text-fd-primary'
                  : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
              )}
            >
              <span className="grid size-5 shrink-0 place-items-center">
                <FileText className="size-3.5" />
              </span>
              <span className="truncate">{node.name}</span>
              {missing.length > 0 ? (
                <Tooltip
                  content={`缺 ${missing.join(' / ')}, 前台会回退到默认语言`}
                >
                  <span className="ml-auto shrink-0 rounded bg-amber-500/15 px-1 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                    缺 {missing.length}
                  </span>
                </Tooltip>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** 过滤后保留命中节点的祖先链, 否则层级会塌掉看不出位置 */
function filterTree(
  nodes: AdminTreeNode[],
  query: string,
  onlyIncomplete: boolean,
  locales: Record<string, string[]>,
  total: number,
): AdminTreeNode[] {
  if (!query && !onlyIncomplete) return nodes;

  const out: AdminTreeNode[] = [];
  for (const node of nodes) {
    if (node.type === 'separator') continue;

    if (node.type === 'folder') {
      const children = filterTree(
        node.children ?? [],
        query,
        onlyIncomplete,
        locales,
        total,
      );
      if (children.length > 0) out.push({ ...node, children });
      continue;
    }

    const hitQuery =
      !query || `${node.name} ${node.slug ?? ''}`.toLowerCase().includes(query);
    // 构建期产物没有「缺语言」这回事, 筛选时排除
    const hitIncomplete =
      !onlyIncomplete ||
      (node.slug !== undefined && node.slug in locales
        ? locales[node.slug].length !== total
        : false);
    if (hitQuery && hitIncomplete) out.push(node);
  }
  return out;
}
