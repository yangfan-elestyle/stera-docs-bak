import errorCodes from '@/error-codes.json';
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

// error-codes.json 的 message key 用 BCP 47 tag, 与站点 locale 不同名。
export const LANG_MAP: Record<Lang, string> = {
  ja: 'ja',
  en: 'en',
  zh: 'zh-CN',
};

export function loadErrorCodes(): ErrorCodeItem[] {
  return errorCodes as ErrorCodeItem[];
}

export function ErrorCodeTable({ lang = 'ja' }: { lang?: Lang }) {
  const messageKey = LANG_MAP[lang];

  const rows: ErrorCodeRow[] = loadErrorCodes().map((item) => ({
    code: item.code,
    httpStatus: item.httpStatus,
    category: item.category,
    message:
      item.message[messageKey] ?? item.message.ja ?? item.message.en ?? '',
  }));

  return <ErrorCodeTableClient rows={rows} lang={lang} />;
}
