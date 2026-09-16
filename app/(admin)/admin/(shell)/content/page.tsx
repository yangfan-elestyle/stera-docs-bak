import type { Metadata } from 'next';
import { ContentTable, type ContentRow } from '@/components/admin/content-table';
import { NewPageDialog } from '@/components/admin/new-page-dialog';
import { PageHeader } from '@/components/admin/page-header';
import { requireUser } from '@/lib/auth/guard';
import { listNavDirs, listSlugs } from '@/lib/cms/content';
import { i18n } from '@/lib/i18n';

export const metadata: Metadata = { title: '内容' };

export default async function ContentListPage() {
  await requireUser();
  const rows: ContentRow[] = listSlugs().map((entry) => ({
    slug: entry.slug,
    section: entry.section,
    title: entry.title,
    titles: entry.titles,
    locales: entry.locales,
    updatedAt: entry.updatedAt.getTime(),
  }));

  return (
    <>
      <PageHeader
        title="内容"
        description={`${rows.length} 篇文档, 每篇有 ${i18n.languages.join(' / ')} 三个语言版本`}
        actions={
          <NewPageDialog
            dirs={listNavDirs()}
            locales={[...i18n.languages]}
            defaultLocale={i18n.defaultLanguage}
          />
        }
      />
      <div className="px-4 py-5 md:px-6">
        <ContentTable rows={rows} languages={[...i18n.languages]} />
      </div>
    </>
  );
}
