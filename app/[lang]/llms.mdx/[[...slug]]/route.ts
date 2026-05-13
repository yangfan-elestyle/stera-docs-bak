import { type NextRequest, NextResponse } from 'next/server';
import { getLLMText, isPageVisibleForHost, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getRequestHost } from '@/lib/tenant';

export const revalidate = false;

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<'/[lang]/llms.mdx/[[...slug]]'>,
) {
  const { slug, lang } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const host = getRequestHost(await headers());
  if (!isPageVisibleForHost(page, lang, host)) notFound();

  return new NextResponse(await getLLMText(page, host), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      // 内容按 host 过滤,跨 host 不可共享;明确 no-store
      // 防止中间 CDN 误缓存把 SMCC 内容透给主站。
      'Cache-Control': 'no-store',
    },
  });
}
