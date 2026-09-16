import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { getSource } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { notFound } from 'next/navigation';
import { SITE } from '@/lib/site';

export default async function Layout({
  params,
  children,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  const tree = (await getSource()).getPageTree(lang);

  if (!tree) {
    return notFound();
  }

  return (
    <DocsLayout
      {...baseOptions(lang)}
      tree={tree}
      tabs={{
        transform: (option) =>
          option.url === '/' ? { ...option, title: SITE.docsTitle } : option,
      }}
    >
      {children}
    </DocsLayout>
  );
}
