import { i18n } from '@/lib/i18n';

export type AdminLocale = (typeof i18n.languages)[number];

/**
 * 后台界面语言 MUST 用独立 cookie, MUST NOT 复用站点的 `FD_LOCALE`。
 * `/admin/preview/[...slug]` 渲染的是站点真实内容, 它跟着「正在编辑的内容语言」走;
 * 共用一个 cookie 会让切界面语言时预览页跟着翻成另一种语言。
 */
export const ADMIN_LOCALE_COOKIE = 'stera_admin_locale';

export const ADMIN_LOCALES = i18n.languages as readonly AdminLocale[];

export const ADMIN_DEFAULT_LOCALE = i18n.defaultLanguage as AdminLocale;

/** 语言名一律用本名, 三份字典里都一样, MUST NOT 翻译 */
export const ADMIN_LOCALE_NAMES: Record<AdminLocale, string> = {
  ja: '日本語',
  en: 'English',
  zh: '中文',
};

export function isAdminLocale(value: string | undefined): value is AdminLocale {
  return (
    value !== undefined && (ADMIN_LOCALES as readonly string[]).includes(value)
  );
}
