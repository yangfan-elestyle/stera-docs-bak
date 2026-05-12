'use client';

import { useMemo, useState } from 'react';
import type { ErrorCodeRow, Lang } from './ErrorCodeTable';

const I18N: Record<
  Lang,
  {
    placeholder: string;
    empty: string;
    noMatch: string;
    matched: string;
  }
> = {
  ja: {
    placeholder: 'コード / カテゴリ / メッセージで絞り込み',
    empty: 'データがありません。',
    noMatch: '一致する項目がありません。',
    matched: '件',
  },
  en: {
    placeholder: 'Filter by code, category, or message',
    empty: 'No data available.',
    noMatch: 'No matching items.',
    matched: 'items',
  },
  zh: {
    placeholder: '按代码 / 类别 / 描述过滤',
    empty: '暂无数据。',
    noMatch: '没有匹配项。',
    matched: '条',
  },
};

function formatCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function ErrorCodeTableClient({
  rows,
  lang,
}: {
  rows: ErrorCodeRow[];
  lang: Lang;
}) {
  const [query, setQuery] = useState('');
  const t = I18N[lang] ?? I18N.ja;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q) ||
        String(r.httpStatus).includes(q),
    );
  }, [rows, query]);

  const total = rows.length;
  const matched = filtered.length;

  return (
    <div>
      {total > 0 && (
        <div className="mb-3 flex items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            className="flex-1 rounded-md border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none"
          />
          <span className="text-sm opacity-70">
            {matched} / {total} {t.matched}
          </span>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>HTTP</th>
            <th>Category</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {total === 0 ? (
            <tr>
              <td colSpan={4} className="text-center opacity-60">
                {t.empty}
              </td>
            </tr>
          ) : matched === 0 ? (
            <tr>
              <td colSpan={4} className="text-center opacity-60">
                {t.noMatch}
              </td>
            </tr>
          ) : (
            filtered.map((r) => (
              <tr key={r.code}>
                <td>
                  <code>{r.code}</code>
                </td>
                <td>{r.httpStatus}</td>
                <td>{formatCategory(r.category)}</td>
                <td>{r.message}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
