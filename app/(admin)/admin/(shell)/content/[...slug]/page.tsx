import { notFound } from 'next/navigation';
import { DocEditor, type LocaleSeed } from '@/components/admin/editor/doc-editor';
import { PageActions } from '@/components/admin/editor/page-actions';
import { PageHeader } from '@/components/admin/page-header';
import { requireUser } from '@/lib/auth/guard';
import { getSlugDocs, slugExists } from '@/lib/cms/content';
import { getDraft } from '@/lib/cms/drafts';
import { i18n } from '@/lib/i18n';
import { slugSegments } from '@/lib/admin/text';

const LOCALE_LABEL: Record<string, string> = { ja: '日本語', en: 'English', zh: '简体中文' };

export default async function EditDocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const user = await requireUser();
  const slug = (await params).slug.map(decodeURIComponent).join('/');
  if (!slugExists(slug)) notFound();

  const docs = getSlugDocs(slug);
  const locales: LocaleSeed[] = i18n.languages.map((locale) => {
    const doc = docs[locale];
    const draft = getDraft(user.id, slug, locale);
    return {
      locale,
      label: LOCALE_LABEL[locale] ?? locale,
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
          { label: '内容', href: '/admin/content' },
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
