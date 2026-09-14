const URL_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

export function getPageMarkdownPath(pageUrl: string): string {
  return `${pageUrl === '/' ? '/index' : pageUrl}.md`;
}

export function getPageMarkdownUrl(
  pageUrl: string,
  origin?: string,
): string {
  return toAbsoluteUrl(getPageMarkdownPath(pageUrl), origin);
}

export function getPageUrl(pageUrl: string, origin?: string): string {
  return toAbsoluteUrl(pageUrl, origin);
}

export function toAbsoluteUrl(
  rawUrl: string,
  origin?: string,
  baseUrl?: string,
): string {
  if (
    !origin ||
    rawUrl.startsWith('#') ||
    rawUrl.startsWith('//') ||
    URL_SCHEME_RE.test(rawUrl)
  ) {
    return rawUrl;
  }

  try {
    return new URL(rawUrl, new URL(baseUrl ?? '/', origin)).toString();
  } catch {
    return rawUrl;
  }
}
