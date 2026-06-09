import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { getFilteredTreeByHost } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getRequestHost } from '@/lib/tenant';
import { getTextValue } from '@/lib/tenant-config';

export default async function Layout({
  params,
  children,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  const host = getRequestHost(await headers());
  const tree = getFilteredTreeByHost(lang, host);
  const homeTitle = getTextValue('home_sidebar_title', host);

  if (!tree) {
    return notFound();
  }

  return (
    <DocsLayout
      {...baseOptions(lang, host)}
      tree={tree}
      tabs={{
        transform: (option) =>
          option.url === '/' ? { ...option, title: homeTitle } : option,
      }}
    >
      {children}
    </DocsLayout>
  );
}
