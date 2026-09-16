import { source } from '@/lib/source';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getRequestHost, getRequestOrigin } from '@/lib/request';
import { getPageMarkdownUrl } from '@/lib/url';

export const revalidate = false;

export async function GET(
  _request: NextRequest,
  context: RouteContext<'/[lang]/llms.txt'>,
) {
  const { lang } = await context.params;
  const host = getRequestHost(await headers());
  const origin = getRequestOrigin(host);
  const lines = (await source.get())
    .getPages(lang)
    .map((p) => `- [${p.data.title}](${getPageMarkdownUrl(p.url, origin)})`);
  return new NextResponse(
    `# stera smart one Documentation\n\n${lines.join('\n')}\n`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        // 链接是按请求 Host 生成的绝对 URL,跨 Host 不可共享;明确 no-store。
        'Cache-Control': 'no-store',
      },
    },
  );
}
