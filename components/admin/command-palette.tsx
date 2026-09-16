'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, Search } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/admin/cn';

export interface CommandItem {
  id: string;
  title: string;
  /** 次要信息, 如 slug 或分组 */
  detail?: string;
  href: string;
  group: string;
  /** 参与匹配但不展示的关键字 */
  keywords?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  items,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 30);
    return items
      .map((item) => {
        const haystack = `${item.title} ${item.detail ?? ''} ${
          item.keywords ?? ''
        }`.toLowerCase();
        const pos = haystack.indexOf(q);
        return pos === -1 ? null : { item, pos };
      })
      .filter((hit): hit is { item: CommandItem; pos: number } => hit !== null)
      .sort((a, b) => a.pos - b.pos)
      .slice(0, 30)
      .map((hit) => hit.item);
  }, [items, query]);

  useEffect(() => setIndex(0), [query]);
  useEffect(() => {
    if (open) setQuery('');
  }, [open]);
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${index}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [index]);

  const go = (item?: CommandItem) => {
    if (!item) return;
    onOpenChange(false);
    router.push(item.href);
  };

  let lastGroup = '';

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in" />
        <DialogPrimitive.Content
          aria-label="命令面板"
          className="fixed left-1/2 top-[15vh] z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-fd-border bg-fd-popover shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95"
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setIndex((i) => Math.min(i + 1, results.length - 1));
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setIndex((i) => Math.max(i - 1, 0));
            } else if (event.key === 'Enter') {
              event.preventDefault();
              go(results[index]);
            }
          }}
        >
          <DialogPrimitive.Title className="sr-only">
            命令面板
          </DialogPrimitive.Title>
          <div className="flex items-center gap-2 border-b border-fd-border px-3">
            <Search className="size-4 shrink-0 text-fd-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索页面标题或 slug…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-fd-muted-foreground"
            />
          </div>

          <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-1.5">
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-fd-muted-foreground">
                没有匹配的结果
              </p>
            ) : (
              results.map((item, i) => {
                const showGroup = item.group !== lastGroup;
                lastGroup = item.group;
                return (
                  <div key={item.id}>
                    {showGroup ? (
                      <p className="px-2 pb-1 pt-2 text-[11px] font-medium text-fd-muted-foreground">
                        {item.group}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      data-index={i}
                      onMouseMove={() => setIndex(i)}
                      onClick={() => go(item)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                        i === index
                          ? 'bg-fd-accent text-fd-accent-foreground'
                          : '',
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{item.title}</span>
                        {item.detail ? (
                          <span className="block truncate font-mono text-[11px] text-fd-muted-foreground">
                            {item.detail}
                          </span>
                        ) : null}
                      </span>
                      {i === index ? (
                        <CornerDownLeft className="size-3.5 shrink-0 text-fd-muted-foreground" />
                      ) : null}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
