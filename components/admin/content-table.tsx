'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowUpDown, FileText, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/admin/cn';
import { formatRelative } from '@/lib/admin/text';
import { Input } from './ui/field';
import {
  Badge,
  EmptyState,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
} from './ui/primitives';

export interface ContentRow {
  slug: string;
  section: string;
  title: string;
  titles: Record<string, string>;
  locales: string[];
  updatedAt: number;
}

type Sort = 'updated' | 'title' | 'slug';

export function ContentTable({
  rows,
  languages,
}: {
  rows: ContentRow[];
  languages: string[];
}) {
  const [query, setQuery] = useState('');
  const [section, setSection] = useState('all');
  const [completeness, setCompleteness] = useState('all');
  const [sort, setSort] = useState<Sort>('updated');

  const sections = useMemo(
    () => [...new Set(rows.map((row) => row.section))].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = rows.filter((row) => {
      if (section !== 'all' && row.section !== section) return false;
      if (
        completeness === 'incomplete' &&
        row.locales.length === languages.length
      )
        return false;
      if (
        completeness === 'complete' &&
        row.locales.length !== languages.length
      )
        return false;
      if (!q) return true;
      // 三种语言的标题都参与匹配: 用日文标题也要能搜到同一页
      return `${row.slug} ${Object.values(row.titles).join(' ')}`
        .toLowerCase()
        .includes(q);
    });

    return result.sort((a, b) => {
      if (sort === 'updated') return b.updatedAt - a.updatedAt;
      if (sort === 'title') return a.title.localeCompare(b.title);
      return a.slug.localeCompare(b.slug);
    });
  }, [rows, query, section, completeness, sort, languages.length]);

  const incomplete = rows.filter(
    (row) => row.locales.length !== languages.length,
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fd-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索标题或 slug（三种语言都匹配）"
            className="pl-9"
          />
        </div>

        <Select value={section} onValueChange={setSection}>
          <SelectTrigger className="w-auto min-w-32">
            <SlidersHorizontal className="size-3.5 text-fd-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分区</SelectItem>
            {sections.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={completeness} onValueChange={setCompleteness}>
          <SelectTrigger className="w-auto min-w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部语言状态</SelectItem>
            <SelectItem value="incomplete">缺语言 ({incomplete})</SelectItem>
            <SelectItem value="complete">三语齐全</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(value) => setSort(value as Sort)}>
          <SelectTrigger className="w-auto min-w-32">
            <ArrowUpDown className="size-3.5 text-fd-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">最近修改</SelectItem>
            <SelectItem value="title">按标题</SelectItem>
            <SelectItem value="slug">按路径</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="没有匹配的页面"
          description="换个关键词, 或把筛选条件放宽。"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-fd-border">
          <table className="w-full text-sm">
            <thead className="bg-fd-card/60 text-left text-xs text-fd-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">页面</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">
                  分区
                </th>
                <th className="px-4 py-2.5 font-medium">语言</th>
                <th className="px-4 py-2.5 text-right font-medium">最后修改</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.slug}
                  className="border-t border-fd-border transition-colors hover:bg-fd-accent/40"
                >
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/admin/content/${row.slug}`}
                      className="block outline-none focus-visible:underline"
                    >
                      <span className="block truncate font-medium">
                        {row.title}
                      </span>
                      <span className="block truncate font-mono text-[11px] text-fd-muted-foreground">
                        {row.slug}
                      </span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-2.5 lg:table-cell">
                    <Badge>{row.section}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      {languages.map((lang) => {
                        const has = row.locales.includes(lang);
                        return (
                          <Tooltip
                            key={lang}
                            content={
                              has
                                ? `${lang}: ${row.titles[lang] ?? '无标题'}`
                                : `缺 ${lang}, 前台会回退到默认语言`
                            }
                          >
                            <span
                              className={cn(
                                'grid h-5 w-7 place-items-center rounded font-mono text-[10px]',
                                has
                                  ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-red-500/12 text-red-700 line-through dark:text-red-400',
                              )}
                            >
                              {lang}
                            </span>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right text-xs text-fd-muted-foreground">
                    {formatRelative(row.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-fd-muted-foreground">
        共 {filtered.length} / {rows.length} 篇
      </p>
    </div>
  );
}
