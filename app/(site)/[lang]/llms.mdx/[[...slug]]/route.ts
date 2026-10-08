import { type NextRequest, NextResponse } from 'next/server';
import {
  getLLMText,
  getSiteTree,
  getSource,
  isHiddenPage,
} from '@/lib/source';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getRequestHost } from '@/lib/request';

export const revalidate = false;

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<'/[lang]/llms.mdx/[[...slug]]'>,
) {
  const { slug, lang } = await params;
  const src = await getSource();
  const page = src.getPage(slug, lang);
  if (!page) notFound();

  const host = getRequestHost(await headers());

  return new NextResponse(await getLLMText(page, host, getSiteTree(src, lang)), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      // 正文内嵌按请求 Host 生成的绝对 URL,跨 Host 不可共享;明确 no-store。
      'Cache-Control': 'no-store',
      // 纯文本没有 <meta robots>, hidden 页的 noindex 只能靠响应头
      ...(isHiddenPage(page) ? { 'X-Robots-Tag': 'noindex' } : {}),
    },
  });
}
