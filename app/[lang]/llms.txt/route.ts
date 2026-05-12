import { isPageVisibleForHost, source } from '@/lib/source';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const revalidate = false;

export async function GET(
  _request: NextRequest,
  context: RouteContext<'/[lang]/llms.txt'>,
) {
  const { lang } = await context.params;
  const host = (await headers()).get('host') ?? '';
  const lines = source
    .getPages(lang)
    .filter((p) => isPageVisibleForHost(p, lang, host))
    .map((p) => `- [${p.data.title}](${p.url === '/' ? '/index' : p.url}.md)`);
  return new NextResponse(
    `# Elepay Documentation\n\n${lines.join('\n')}\n`,
    {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    },
  );
}
