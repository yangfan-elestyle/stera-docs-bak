import { getLLMText, source } from '@/lib/source';
import { NextRequest } from 'next/server';

export const revalidate = false;

export async function GET(
  _request: NextRequest,
  context: RouteContext<'/[lang]/llms-full.txt'>,
) {
  const { lang } = await context.params;
  const scan = source.getPages(lang).map(getLLMText);
  const scanned = await Promise.all(scan);

  return new Response(scanned.join('\n\n'));
}
