import { DICTS, type AdminDict } from './dict';
import { getAdminLocale } from './locale';
import type { AdminLocale } from './shared';
import { translate, type T } from './translate';

export interface AdminI18n {
  locale: AdminLocale;
  /** 纯对象, 可以作 prop 传给 client component */
  dict: AdminDict;
  /** 只在服务端渲染期用; MUST NOT 作 prop 传给 client component (函数跨不了 RSC 边界) */
  t: T;
}

export async function getAdminI18n(): Promise<AdminI18n> {
  const locale = await getAdminLocale();
  const dict = DICTS[locale];
  return { locale, dict, t: (key, vars) => translate(dict, key, vars) };
}

/** server action 里报错文案用这个, 比整包 getAdminI18n 省一次对象构造 */
export async function getAdminT(): Promise<T> {
  return (await getAdminI18n()).t;
}
