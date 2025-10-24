import { getPageImage, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound, redirect } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { baseUrl } from '@/lib/metadata';

export const revalidate = false;

export default async function Page(props: PageProps<'/[lang]/[[...slug]]'>) {
  const { slug, lang } = await props.params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

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

  return (
    <DocsPage
      toc={filteredToc}
      full={page.data.full}
      tableOfContent={{ style: 'clerk' }}
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
