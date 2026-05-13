import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { getFilteredTreeByHost, source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getRequestHost } from '@/lib/tenant';

export default async function Layout({
  params,
  children,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  const hdrs = await headers();
  const host = getRequestHost(hdrs);
  const tree = getFilteredTreeByHost(lang, host);

  if (!tree) {
    return notFound();
  }

  return (
    <DocsLayout tree={tree} {...baseOptions(lang, host)}>
      {children}
    </DocsLayout>
  );
}
