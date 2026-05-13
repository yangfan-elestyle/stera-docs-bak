import { isPageVisibleForHost, source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { createTokenizer as createJapaneseTokenizer } from '@orama/tokenizers/japanese';
import { stopwords as japaneseStopwords } from '@orama/stopwords/japanese';
import { createTokenizer as createMandarinTokenizer } from '@orama/tokenizers/mandarin';
import { stopwords as mandarinStopwords } from '@orama/stopwords/mandarin';
import { getRequestHost } from '@/lib/tenant';

const searchApi = createFromSource(source, {
  localeMap: {
    en: { language: 'english' },
    ja: {
      components: {
        tokenizer: createJapaneseTokenizer({
          language: 'japanese',
          stopWords: japaneseStopwords,
        }),
      },
    },
    zh: {
      components: {
        tokenizer: createMandarinTokenizer({
          language: 'mandarin',
          stopWords: mandarinStopwords,
        }),
      },
    },
  },
});

export const staticGET = searchApi.staticGET;

export async function GET(request: Request) {
  const response = await searchApi.GET(request);
  const results = (await response.json()) as Array<{ url?: string }>;
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') ?? undefined;
  const host = getRequestHost(request.headers);

  return Response.json(
    results.filter((result) => {
      if (!result.url) return true;

      const href = result.url.split('#')[0];
      const entry = locale
        ? source.getPageByHref(href, { language: locale })
        : source.getPageByHref(href);

      if (!entry) return true;

      return isPageVisibleForHost(
        entry.page,
        (entry.page as any).locale ?? locale ?? 'ja',
        host,
      );
    }),
    {
      // 结果按 host (XFH) 过滤,跨 host 不可共享;明确 no-store
      // 防止中间 CDN 误缓存把 SMCC 内容透给主站。
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
