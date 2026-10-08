import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { getSiteTree, getSource } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { notFound } from 'next/navigation';
import { SITE } from '@/lib/site';

export default async function Layout({
  params,
  children,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  const tree = getSiteTree(await getSource(), lang);
  const base = baseOptions(lang);

  if (!tree) {
    return notFound();
  }

  return (
    <DocsLayout
      {...base}
      // 文档/API 切换已由侧边栏 tab 下拉提供, main 链接在侧边栏里重复, 只留图标链接
      links={base.links?.filter((link) => link.type !== 'main')}
      tree={tree}
      tabs={{
        // Docs tab 的 url 取自该 root 文件夹的首个页面, 即总览页 /overview
        transform: (option) =>
          option.url === '/overview' ? { ...option, title: SITE.docsTitle } : option,
      }}
    >
      {children}
    </DocsLayout>
  );
}
