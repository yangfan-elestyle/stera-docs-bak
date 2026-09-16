import Link from 'next/link';
import { requireUser } from '@/lib/auth/guard';
import { listSlugs } from '@/lib/cms/content';
import { i18n } from '@/lib/i18n';

export default async function ContentListPage() {
  await requireUser();
  const entries = listSlugs();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">内容 ({entries.length} 篇)</h1>
      <table className="w-full text-sm">
        <thead className="text-left text-fd-muted-foreground">
          <tr>
            <th className="py-2">标题</th>
            <th>slug</th>
            <th>语言</th>
            <th>最后修改</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.slug} className="border-t border-fd-border">
              <td className="py-2">
                <Link href={`/admin/content/${entry.slug}`} className="hover:underline">
                  {entry.title}
                </Link>
              </td>
              <td className="font-mono text-xs text-fd-muted-foreground">{entry.slug}</td>
              <td>
                {/* 缺哪几种语言要一眼看得出来, 缺失的会在前台回退到默认语言而不报错 */}
                {i18n.languages.map((lang) => (
                  <span
                    key={lang}
                    className={
                      entry.locales.includes(lang)
                        ? 'mr-2'
                        : 'mr-2 text-red-600 line-through'
                    }
                  >
                    {lang}
                  </span>
                ))}
              </td>
              <td className="text-fd-muted-foreground">
                {entry.updatedAt.toISOString().slice(0, 10)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
