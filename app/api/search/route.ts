import { getSitePages, getSource, type DocsSource } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { createTokenizer as createJapaneseTokenizer } from '@orama/tokenizers/japanese';
import { stopwords as japaneseStopwords } from '@orama/stopwords/japanese';
import { createTokenizer as createMandarinTokenizer } from '@orama/tokenizers/mandarin';
import { stopwords as mandarinStopwords } from '@orama/stopwords/mandarin';

// createFromSource 按 loader 对象 (WeakMap) 缓存索引: 视图 MUST 按 src memo,
// 每次请求新建视图 = 每次搜索都全量重建索引。
// Object.create 保留原型上的其余方法 (getPageTree / getNodePage 等), 只覆盖 getPages。
const views = new WeakMap<DocsSource, DocsSource>();

async function getSearchSource(): Promise<DocsSource> {
  const src = await getSource();
  let view = views.get(src);
  if (!view) {
    view = Object.assign(Object.create(src) as DocsSource, {
      getPages: (lang?: string) => getSitePages(src, lang),
    });
    views.set(src, view);
  }
  return view;
}

const searchApi = createFromSource(getSearchSource, {
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

export const { GET, staticGET } = searchApi;
