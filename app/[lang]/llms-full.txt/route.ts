import { getLLMText, isPageVisibleForHost, source } from '@/lib/source';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getRequestHost } from '@/lib/tenant';

export const revalidate = false;

export async function GET(
  _request: NextRequest,
  context: RouteContext<'/[lang]/llms-full.txt'>,
) {
  const { lang } = await context.params;
  const host = getRequestHost(await headers());
  const scan = source
    .getPages(lang)
    .filter((p) => isPageVisibleForHost(p, lang, host))
    .map((p) => getLLMText(p, host));
  const scanned = await Promise.all(scan);

  return new NextResponse(scanned.join('\n\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // 内容按 host 过滤,跨 host 不可共享;明确 no-store
      // 防止中间 CDN 误缓存把 SMCC 内容透给主站。
      'Cache-Control': 'no-store',
    },
  });
}
