/** 中日文没有空格分词, 按「非空白字符数 + 西文单词数」给一个可用的规模感。 */
export function countWords(text: string): number {
  const cjk = (text.match(/[぀-ヿ㐀-鿿＀-￯]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z0-9]+/g) ?? []).length;
  return cjk + latin;
}

export function formatDateTime(value: Date | string | number): string {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * 相对时间。用 `Intl.RelativeTimeFormat` 而不是自己拼字符串: 三种语言白得正确的
 * 词序与单复数, numeric:'auto' 还会把 -1 天说成「昨天 / 昨日 / yesterday」。
 * `formatDateTime` 不换 `Intl.DateTimeFormat` —— 它输出的 `YYYY-MM-DD HH:mm` 本来就
 * 语言中立, 换过去只会引入服务端 / 客户端时区不一致的 hydration 风险。
 */
export function formatRelative(
  value: Date | string | number,
  locale: string,
): string {
  const diff = Date.now() - new Date(value).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (diff < minute) return rtf.format(0, 'second');
  if (diff < hour) return rtf.format(-Math.floor(diff / minute), 'minute');
  if (diff < day) return rtf.format(-Math.floor(diff / hour), 'hour');
  if (diff < 30 * day) return rtf.format(-Math.floor(diff / day), 'day');
  return formatDateTime(value).slice(0, 10);
}

/** slug -> 面包屑片段, 去掉 (home) 这类 route group 括号段 */
export function slugSegments(slug: string): string[] {
  return slug.split('/').filter((part) => !/^\(.*\)$/.test(part));
}

/** CMS slug -> 站点公开 URL */
export function publicUrl(slug: string): string {
  const path = slugSegments(slug)
    .join('/')
    .replace(/(^|\/)index$/, '');
  return `/${path}`;
}
