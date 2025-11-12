import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { createTokenizer as createJapaneseTokenizer } from '@orama/tokenizers/japanese';
import { stopwords as japaneseStopwords } from '@orama/stopwords/japanese';
import { createTokenizer as createMandarinTokenizer } from '@orama/tokenizers/mandarin';
import { stopwords as mandarinStopwords } from '@orama/stopwords/mandarin';

export const { GET } = createFromSource(source, {
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
