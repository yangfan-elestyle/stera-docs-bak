import type { AdminDict, AdminDictKey } from './dict';

export type Vars = Record<string, string | number>;

/** `{name}` 占位符替换; 找不到的键原样返回键名, 好在页面上一眼看出漏翻 */
export function translate(
  dict: AdminDict,
  key: AdminDictKey,
  vars?: Vars,
): string {
  const template = dict[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export type T = (key: AdminDictKey, vars?: Vars) => string;
