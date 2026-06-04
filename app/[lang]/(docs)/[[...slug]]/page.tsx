import {
  getFilteredFooterItems,
  getPageDescription,
  getPageImage,
  isPageVisibleForHost,
  source,
} from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getRequestHost, getRequestProtocol } from '@/lib/tenant';

export const revalidate = false;

function getRequestBaseUrl(hdrs: Awaited<ReturnType<typeof headers>>) {
  const host = getRequestHost(hdrs);
  if (!host) return undefined;

  const proto = getRequestProtocol(host);

  try {
    return new URL(`${proto}://${host}`);
  } catch {
    return undefined;
  }
}

export default async function Page(props: PageProps<'/[lang]/[[...slug]]'>) {
  const { slug, lang } = await props.params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  // Enforce tenant-based visibility to prevent direct access via URL
  const hdrs = await headers();
  const host = getRequestHost(hdrs);
  if (!isPageVisibleForHost(page, lang, host)) notFound();

  // Handle redirect if specified in frontmatter
  if (page.data.redirect) {
    redirect(`/${lang}${page.data.redirect}`);
  }

  const MDX = page.data.body;

  // Filter TOC based on tocMaxDepth from frontmatter
  const tocMaxDepth = page.data.tocMaxDepth;
  const filteredToc =
    tocMaxDepth !== undefined
      ? page.data.toc.filter((item) => item.depth <= tocMaxDepth)
      : page.data.toc;

  // Compute footer items
  const footerItems = getFilteredFooterItems(page, lang, host);

  return (
    <DocsPage
      toc={filteredToc}
      full={page.data.full}
      tableOfContent={{ style: 'clerk' }}
      footer={{ items: footerItems }}
      lastUpdate={page.data.lastModified}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateMetadata(
  props: PageProps<'/[lang]/[[...slug]]'>,
): Promise<Metadata> {
  const { slug, lang } = await props.params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const hdrs = await headers();
  const requestBaseUrl = getRequestBaseUrl(hdrs);
  const pageImage = getPageImage(page);

  return {
    title: page.data.title,
    description: getPageDescription(page),
    ...(requestBaseUrl
      ? {
          openGraph: {
            url: `${requestBaseUrl.origin}${page.url}`,
            images: `${requestBaseUrl.origin}${pageImage.url}`,
          },
          metadataBase: requestBaseUrl,
        }
      : {}),
  };
}
