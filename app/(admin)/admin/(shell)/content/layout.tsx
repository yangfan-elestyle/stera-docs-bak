import { ContentWorkspace } from '@/components/admin/workspace/workspace';
import { requireUser } from '@/lib/auth/guard';
import { listNavDirs } from '@/lib/cms/content';
import { buildAdminTree } from '@/lib/cms/tree';
import { i18n } from '@/lib/i18n';

// 左树放在 layout 里: 在页面之间跳转时它不重挂, 展开状态、滚动位置与搜索词都留着。
export default async function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <ContentWorkspace
      tree={await buildAdminTree()}
      languages={[...i18n.languages]}
      defaultLocale={i18n.defaultLanguage}
      navDirs={listNavDirs()}
    >
      {children}
    </ContentWorkspace>
  );
}
