import { cookies, headers } from 'next/headers';
import {
  ADMIN_DEFAULT_LOCALE,
  ADMIN_LOCALE_COOKIE,
  isAdminLocale,
  type AdminLocale,
} from './shared';

// 这个文件拉 `next/headers`, MUST 只被服务端代码 import。
// 常量与类型在 `./shared`, 客户端组件走那一份 —— 从这里 import 会把 next/headers
// 拖进客户端依赖图, turbopack 直接 500。

/** `ja-JP,ja;q=0.9,en;q=0.8` -> 按 q 降序的主语言标签 */
function negotiate(header: string | null): AdminLocale | undefined {
  if (!header) return undefined;
  return header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params
        .map((item) => item.trim())
        .find((item) => item.startsWith('q='))
        ?.slice(2);
      return { tag: tag.toLowerCase().split('-')[0], q: q ? Number(q) : 1 };
    })
    .filter((entry) => Number.isFinite(entry.q))
    .sort((a, b) => b.q - a.q)
    .find((entry) => isAdminLocale(entry.tag))?.tag as AdminLocale | undefined;
}

/**
 * cookie 优先, 其次浏览器 Accept-Language, 最后回落默认语言。
 * 登录页在 (shell) 之外, 没有任何已保存偏好, 协商这一步是非日语母语者第一眼不撞日文的唯一保障。
 */
export async function getAdminLocale(): Promise<AdminLocale> {
  const saved = (await cookies()).get(ADMIN_LOCALE_COOKIE)?.value;
  if (isAdminLocale(saved)) return saved;
  return negotiate((await headers()).get('accept-language')) ?? ADMIN_DEFAULT_LOCALE;
}
