import { unstable_cache } from 'next/cache';
import snapshot from '@/data/error-codes.snapshot.json';
import { getErrorCodesUrl } from '@/lib/env';
import { ErrorCodeTableClient } from './ErrorCodeTableClient';

export type Lang = 'ja' | 'en' | 'zh';

export interface ErrorCodeRow {
  code: string;
  httpStatus: number;
  category: string;
  message: string;
}

export interface ErrorCodeItem {
  code: string;
  httpStatus: number;
  category: string;
  message: Record<string, string>;
}

export interface ErrorCodesResponse {
  generatedAt: string;
  items: ErrorCodeItem[];
}

export const LANG_MAP: Record<Lang, string> = {
  ja: 'ja',
  en: 'en',
  zh: 'zh-CN',
};

const REVALIDATE_SECONDS = 3600 * 6;

const loadFromApi = unstable_cache(
  async (url: string): Promise<ErrorCodesResponse> => {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as ErrorCodesResponse;
  },
  ['error-codes'],
  { revalidate: REVALIDATE_SECONDS, tags: ['error-codes'] },
);

export async function loadErrorCodes(): Promise<ErrorCodesResponse> {
  const apiUrl = getErrorCodesUrl();

  try {
    return await loadFromApi(apiUrl);
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    const fallback = snapshot as ErrorCodesResponse;
    console.warn(
      `[ErrorCodeTable] fetch failed: ${reason} -> snapshot items=${fallback.items.length}`,
    );
    return fallback;
  }
}

export async function ErrorCodeTable({ lang = 'ja' }: { lang?: Lang }) {
  const data = await loadErrorCodes();
  const messageKey = LANG_MAP[lang];

  const rows: ErrorCodeRow[] = data.items.map((item) => ({
    code: item.code,
    httpStatus: item.httpStatus,
    category: item.category,
    message:
      item.message[messageKey] ??
      item.message.ja ??
      item.message.en ??
      '',
  }));

  return <ErrorCodeTableClient rows={rows} lang={lang} />;
}
