import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, Lock } from 'lucide-react';
import { Card } from '@/components/admin/ui/primitives';
import { getSource } from '@/lib/source';
import { DocEditor, type LocaleSeed } from '@/components/admin/editor/doc-editor';
import { PageActions } from '@/components/admin/editor/page-actions';
import { PageHeader } from '@/components/admin/page-header';
import { requireUser } from '@/lib/auth/guard';
import { getSlugDocs, slugExists } from '@/lib/cms/content';
import { getDraft } from '@/lib/cms/drafts';
import { i18n } from '@/lib/i18n';
import { ADMIN_LOCALE_NAMES, type AdminLocale } from '@/lib/admin/i18n/shared';
import { getAdminI18n } from '@/lib/admin/i18n/server';
import { slugSegments } from '@/lib/admin/text';

export default async function EditDocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const user = await requireUser();
  const slug = (await params).slug.map(decodeURIComponent).join('/');
  const { t } = await getAdminI18n();

  if (!slugExists(slug)) {
    // 站点上有、库里没有 = 构建期产物 (openapi*.yaml 生成的那 153 页)。
    // 直接 404 会让人以为坏了, 说清楚它为什么不能在这里改。
    // 按虚拟路径找, 不按 URL 段找: (generated) 这类 route group 在 URL 里会被吃掉,
    // index.mdx 也不对应自己的 URL 段, 用 getPage(slug 段) 一律查不到。
    const src = await getSource();
    const sitePage = src
      .getPages(i18n.defaultLanguage)
      .find((page) => page.path === `${slug}.mdx`);
    if (!sitePage) notFound();

    return (
      <>
        <PageHeader
          breadcrumbs={[{ label: t('content.title'), href: '/admin/content' }]}
          title={sitePage.data.title ?? slug}
          description={<span className="font-mono text-xs">{slug}</span>}
        />
        <div className="px-4 py-6 md:px-6">
          <Card className="flex max-w-xl flex-col items-start gap-3 p-6">
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              <Lock className="size-4 text-fd-muted-foreground" />
              {t('buildtime.title')}
            </span>
            <p className="text-sm leading-relaxed text-fd-muted-foreground">
              {t('buildtime.descBefore')}
              <code className="rounded bg-fd-muted px-1 font-mono text-xs">openapi*.yaml</code>
              {t('buildtime.descAfter')}
            </p>
            <Link
              href={sitePage.url}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary hover:underline"
            >
              {t('buildtime.viewOnSite')}
              <ExternalLink className="size-3.5" />
            </Link>
          </Card>
        </div>
      </>
    );
  }

  const docs = getSlugDocs(slug);
  const locales: LocaleSeed[] = i18n.languages.map((locale) => {
    const doc = docs[locale];
    const draft = getDraft(user.id, slug, locale);
    return {
      locale,
      label: ADMIN_LOCALE_NAMES[locale as AdminLocale] ?? locale,
      content: doc?.content ?? null,
      updatedAt: doc?.updatedAt.getTime() ?? null,
      draft: draft ? { content: draft.content, updatedAt: draft.updatedAt.getTime() } : null,
    };
  });

  const title =
    locales.find((item) => item.locale === i18n.defaultLanguage)?.content?.match(/^title:\s*(.+)$/m)?.[1] ??
    slug;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        breadcrumbs={[
          { label: t('content.title'), href: '/admin/content' },
          ...slugSegments(slug).slice(0, -1).map((part) => ({ label: part })),
        ]}
        title={title.replace(/^["']|["']$/g, '')}
        description={<span className="font-mono text-xs">{slug}</span>}
        actions={<PageActions slug={slug} />}
      />
      <DocEditor slug={slug} locales={locales} defaultLocale={i18n.defaultLanguage} />
    </div>
  );
}
