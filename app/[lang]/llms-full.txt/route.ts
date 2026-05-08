import { getLLMText, isPageVisibleForHost, source } from '@/lib/source';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const revalidate = false;

export async function GET(
  _request: NextRequest,
  context: RouteContext<'/[lang]/llms-full.txt'>,
) {
  const { lang } = await context.params;
  const host = (await headers()).get('host') ?? '';
  const scan = source
    .getPages(lang)
    .filter((p) => isPageVisibleForHost(p, lang, host))
    .map(getLLMText);
  const scanned = await Promise.all(scan);

  return new NextResponse(scanned.join('\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
