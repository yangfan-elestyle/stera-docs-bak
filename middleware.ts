import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from 'next/server';
import { i18n } from '@/lib/i18n';
import { resolveLegacyRedirect } from '@/lib/legacy-redirects';

const i18nMiddleware = createI18nMiddleware(i18n);

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // 旧 ReadMe URL 须在 i18n rewrite 之前拦下, 否则落进 [...slug] 404 -> 首页。
  const target = resolveLegacyRedirect(request.nextUrl.pathname);
  if (target) {
    const url = new URL(target, request.nextUrl);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url, 301);
  }
  return i18nMiddleware(request, event);
}

export const config = {
  // Middleware 先于 filesystem 路由执行,i18n 会把裸路径 rewrite 成 /{locale}/...,
  // 导致 public/ 静态文件命中失败 -> public/ 下的文件必须排除。
  // /admin 与 /uploads 同样排除:后台不做多语言,后台上传的图片也不该被 rewrite。
  // (.md / llms.txt 是真实路由,依赖该 rewrite,MUST NOT 一并排除。)
  matcher: [
    '/((?!api|admin|uploads|_next/static|_next/image|favicon.ico|docs/.*\\.(?:png|jpe?g|webp|gif|svg|avif|zip)).*)',
  ],
};
