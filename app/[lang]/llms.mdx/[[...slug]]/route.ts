import { type NextRequest, NextResponse } from 'next/server';
import { getLLMText, isPageVisibleForHost, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

export const revalidate = false;

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<'/[lang]/llms.mdx/[[...slug]]'>,
) {
  const { slug, lang } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const host = (await headers()).get('host') ?? '';
  if (!isPageVisibleForHost(page, lang, host)) notFound();

  return new NextResponse(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
