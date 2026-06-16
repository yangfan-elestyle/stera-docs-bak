import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import {
  NextFetchEvent,
  NextRequest,
  NextResponse,
} from 'next/server';
import { i18n } from '@/lib/i18n';
import { detectTenantByHost, getRequestHost } from '@/lib/tenant';

const i18nMiddleware = createI18nMiddleware(i18n);

// 非 HTML 路由(.md / llms.txt 等)响应不含 <link rel=icon>,浏览器只能 fallback
// 到 /favicon.ico。按租户 redirect 到对应文件,避免裸 404 + 错租户图标。
// 用 redirect 而非 rewrite: CF Workers + OpenNext 架构下,内部 rewrite 不会再
// 回到 Assets binding,只有重新发起请求才能让静态文件正常命中。
export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (req.nextUrl.pathname === '/favicon.ico') {
    const tenant = detectTenantByHost(getRequestHost(req.headers));
    const url = req.nextUrl.clone();
    url.pathname =
      tenant === 'smcc' ? '/favicon-smcc.ico' : '/favicon-default.ico';
    return NextResponse.redirect(url, 307);
  }
  return i18nMiddleware(req, event);
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  // You may need to adjust it to ignore static assets in `/public` folder
  matcher: [
    '/((?!api|_next/static|_next/image|favicon-default.ico|favicon-smcc.ico|docs/resources).*)',
  ],
};
