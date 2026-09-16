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

export function formatRelative(value: Date | string | number): string {
  const diff = Date.now() - new Date(value).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`;
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
