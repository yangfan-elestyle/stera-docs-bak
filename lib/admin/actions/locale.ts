'use server';

import { cookies } from 'next/headers';
import { ADMIN_LOCALES, ADMIN_LOCALE_COOKIE, type AdminLocale } from '@/lib/admin/i18n/shared';

/**
 * 切后台界面语言。
 *
 * MUST 走 server action: Server Component 渲染期调 `cookies().set()` 会抛。
 * 不鉴权 —— 它只改自己浏览器里的一个显示偏好, 登录页也要用。
 * cookie 限定 `path: '/admin'`, 不参与站点侧的语言判定。
 */
export async function setAdminLocaleAction(locale: string): Promise<void> {
  if (!(ADMIN_LOCALES as readonly string[]).includes(locale)) return;
  (await cookies()).set(ADMIN_LOCALE_COOKIE, locale as AdminLocale, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/admin',
    maxAge: 60 * 60 * 24 * 365,
  });
}
