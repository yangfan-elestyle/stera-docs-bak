import { getPageImage, isPageVisibleForHost, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';
import { headers } from 'next/headers';
import { getRequestHost } from '@/lib/tenant';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/[lang]/og/[...slug]'>,
) {
  const { slug, lang } = await params;
  const page = source.getPage(slug.slice(0, -1), lang);
  if (!page) notFound();

  const host = getRequestHost(await headers());
  if (!isPageVisibleForHost(page, lang, host)) notFound();

  return new ImageResponse(
    (
      <DefaultImage
        title={page.data.title}
        description={page.data.description}
        site="elepay Docs"
      />
    ),
    {
      width: 1200,
      height: 630,
      // OG 内容按 host 过滤 (SMCC 专属页隐藏于主站),跨 host 不可共享;明确 no-store
      // 防止中间 CDN 误缓存把 SMCC 内容透给主站。
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
