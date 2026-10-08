import {
  getLLMText,
  getSitePages,
  getSiteTree,
  getSource,
} from '@/lib/source';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getRequestHost } from '@/lib/request';

export const revalidate = false;

export async function GET(
  _request: NextRequest,
  context: RouteContext<'/[lang]/llms-full.txt'>,
) {
  const { lang } = await context.params;
  const host = getRequestHost(await headers());
  const src = await getSource();
  const tree = getSiteTree(src, lang);
  const scan = getSitePages(src, lang).map((p) => getLLMText(p, host, tree));
  const scanned = await Promise.all(scan);

  return new NextResponse(scanned.join('\n\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // 正文内嵌按请求 Host 生成的绝对 URL,跨 Host 不可共享;明确 no-store。
      'Cache-Control': 'no-store',
    },
  });
}
