import {
  getFilteredFooterItems,
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
import { baseUrl } from '@/lib/metadata';
import {
  MarkdownCopyButton,
  ViewOptionsPopover,
} from '@/components/ai/page-actions';

export const revalidate = false;

export default async function Page(props: PageProps<'/[lang]/[[...slug]]'>) {
  const { slug, lang } = await props.params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  // Enforce tenant-based visibility to prevent direct access via URL
  const hdrs = await headers();
  const host = hdrs.get('host') ?? '';
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

  // LLM page actions: matches `/:lang/:path*.md` rewrite in next.config.mjs.
  // Root index special case: `:path*` doesn't accept empty, so use `/index.md`
  // to align with `llms.txt` route.
  const markdownUrl = `${page.url === '/' ? '/index' : page.url}.md`;

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
      <div className="flex flex-row gap-2 items-center pb-2">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} />
      </div>
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

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      url: `${baseUrl.origin}${page.url}`,
      images: getPageImage(page).url,
    },
    metadataBase: baseUrl,
  };
}
