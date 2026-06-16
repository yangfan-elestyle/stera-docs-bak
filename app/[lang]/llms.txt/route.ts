import { isPageVisibleForHost, source } from '@/lib/source';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getRequestHost, getRequestOrigin } from '@/lib/tenant';
import { getPageMarkdownUrl } from '@/lib/url';

export const revalidate = false;

export async function GET(
  _request: NextRequest,
  context: RouteContext<'/[lang]/llms.txt'>,
) {
  const { lang } = await context.params;
  const host = getRequestHost(await headers());
  const origin = getRequestOrigin(host);
  const lines = source
    .getPages(lang)
    .filter((p) => isPageVisibleForHost(p, lang, host))
    .map((p) => `- [${p.data.title}](${getPageMarkdownUrl(p.url, origin)})`);
  return new NextResponse(
    `# Elepay Documentation\n\n${lines.join('\n')}\n`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        // 列表按 host 过滤,跨 host 不可共享;明确 no-store
        // 防止中间 CDN 误缓存把 SMCC 内容透给主站。
        'Cache-Control': 'no-store',
      },
    },
  );
}
