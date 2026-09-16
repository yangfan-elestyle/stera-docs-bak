import type { Metadata } from 'next';
import { NavEditor, type NavSeed } from '@/components/admin/nav-editor/nav-editor';
import { PageHeader } from '@/components/admin/page-header';
import { requireUser } from '@/lib/auth/guard';
import { listNav } from '@/lib/cms/content';
import { i18n } from '@/lib/i18n';

export const metadata: Metadata = { title: '导航' };

export default async function NavigationPage() {
  await requireUser();
  const entries: NavSeed[] = listNav().map((entry) => ({
    dir: entry.dir,
    locale: entry.locale,
    json: entry.data,
  }));

  return (
    <>
      <PageHeader
        title="导航"
        description="侧边栏的分组、排序与分段说明。每种语言各一份, 改一份不影响其他语言。"
      />
      <div className="px-4 py-5 md:px-6">
        <NavEditor entries={entries} locales={[...i18n.languages]} />
      </div>
    </>
  );
}
