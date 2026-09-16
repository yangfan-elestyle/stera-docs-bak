import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ListTree, MousePointerSquareDashed } from 'lucide-react';
import { NavPanelHost } from '@/components/admin/workspace/nav-panel-host';
import { PageHeader } from '@/components/admin/page-header';
import { Card } from '@/components/admin/ui/primitives';
import { requireUser } from '@/lib/auth/guard';
import { listNav, listSlugs } from '@/lib/cms/content';
import { formatRelative } from '@/lib/admin/text';
import { i18n } from '@/lib/i18n';

export const metadata: Metadata = { title: '内容' };

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ nav?: string }>;
}) {
  await requireUser();
  const nav = (await searchParams).nav;

  if (nav !== undefined) {
    const json = Object.fromEntries(
      listNav()
        .filter((entry) => entry.dir === nav)
        .map((entry) => [entry.locale, entry.data]),
    );
    return (
      <>
        <PageHeader
          breadcrumbs={[{ label: '内容', href: '/admin/content' }, { label: '分组设置' }]}
          title={nav || '(根目录)'}
          description="这一组在侧边栏里的排序、分段与分段说明"
        />
        <div className="px-4 py-5 md:px-6">
          <NavPanelHost dir={nav} json={json} defaultLocale={i18n.defaultLanguage} />
        </div>
      </>
    );
  }

  const docs = listSlugs();
  const recent = [...docs]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);

  return (
    <>
      <PageHeader title="内容" description={`${docs.length} 篇文档 · 左侧就是站点侧边栏`} />
      <div className="space-y-5 px-4 py-6 md:px-6">
        <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <div className="rounded-full bg-fd-muted p-3 text-fd-muted-foreground">
            <MousePointerSquareDashed className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">在左边选一篇文档开始编辑</p>
            <p className="mx-auto max-w-md text-sm text-fd-muted-foreground">
              左侧这棵树与站点侧边栏完全一致。点页面改正文, 点分组右侧的
              <ListTree className="mx-1 inline size-3.5" />
              齿轮改这一组的排序与分段说明。
            </p>
          </div>
        </Card>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">最近修改</h2>
          <Card className="divide-y divide-fd-border">
            {recent.map((doc) => (
              <Link
                key={doc.slug}
                href={`/admin/content/${doc.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-fd-accent/40"
              >
                <FileText className="size-3.5 shrink-0 text-fd-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{doc.title}</span>
                <span className="shrink-0 text-xs text-fd-muted-foreground">
                  {formatRelative(doc.updatedAt)}
                </span>
              </Link>
            ))}
          </Card>
        </section>
      </div>
    </>
  );
}
