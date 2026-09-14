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
// 用 redirect 而非 rewrite: rewrite 后的路径不再回到 public/ 文件系统路由,
// 只有重新发起请求才能让静态文件正常命中。
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
  // Middleware 先于 filesystem 路由执行,i18n 会把裸路径 rewrite 成 /{locale}/...,
  // 导致 public/ 静态文件命中失败 -> public/docs/** 的图片与 SDK 包必须排除。
  // (.md / llms.txt 是真实路由,依赖该 rewrite,MUST NOT 一并排除。)
  matcher: [
    '/((?!api|_next/static|_next/image|favicon-default.ico|favicon-smcc.ico|docs/.*\\.(?:png|jpe?g|webp|zip)).*)',
  ],
};
