import {
  getFooterItems,
  getLastModified,
  getPageDescription,
  getPageImage,
  getSource,
  loadDoc,
} from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage } from 'fumadocs-ui/page';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getRequestHost, getRequestProtocol } from '@/lib/request';
import DocsTitleBar from '@/components/DocsTitleBar';
import { getPageMarkdownPath, getPageUrl } from '@/lib/url';

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
  const src = await getSource();
  const page = src.getPage(slug, lang);
  if (!page) notFound();

  // Handle redirect if specified in frontmatter
  if (page.data.redirect) {
    redirect(`/${lang}${page.data.redirect}`);
  }

  const { body: MDX, toc } = await loadDoc(page);

  // Filter TOC based on tocMaxDepth from frontmatter
  const tocMaxDepth = page.data.tocMaxDepth;
  const filteredToc =
    tocMaxDepth !== undefined
      ? toc.filter((item) => item.depth <= tocMaxDepth)
      : toc;

  // Compute footer items
  const footerItems = getFooterItems(src, page, lang);

  // 概要页（EHome 导航卡片，无真实 markdown 正文）移除 markdown 相关功能
  const isOverview = page.url === '/' || page.url === '/openapi';
  const markdownUrl = isOverview ? undefined : getPageMarkdownPath(page.url);

  return (
    <DocsPage
      toc={filteredToc}
      full={page.data.full}
      tableOfContent={{ style: 'clerk' }}
      footer={{ items: footerItems }}
      lastUpdate={getLastModified(page)}
    >
      <DocsTitleBar
        title={page.data.title}
        pageUrl={page.url}
        markdownUrl={markdownUrl}
      />
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents(src.getPageTree(lang), {
            a: createRelativeLink(src, page),
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
  const page = (await getSource()).getPage(slug, lang);
  if (!page) notFound();

  const hdrs = await headers();
  const requestBaseUrl = getRequestBaseUrl(hdrs);
  const pageImage = getPageImage(page);

  return {
    title: page.data.title,
    description: await getPageDescription(page),
    ...(requestBaseUrl
      ? {
          openGraph: {
            url: getPageUrl(page.url, requestBaseUrl.origin),
            images: getPageUrl(pageImage.url, requestBaseUrl.origin),
          },
          metadataBase: requestBaseUrl,
        }
      : {}),
  };
}
