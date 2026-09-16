import { i18n } from '@/lib/i18n';

// 库里按 (slug, locale) 两列存, 取出来要还原成 fumadocs 认的虚拟路径。
// 默认语言 MUST 还原成无后缀形式 (`x.mdx` 而非 `x.ja.mdx`): 两者落到同一个 storage key,
// 功能上等价, 但 page.path 会带出差异, 迁移比对时看着像内容变了。
const DEFAULT = i18n.defaultLanguage;
const LOCALES = new Set<string>(i18n.languages);

function suffix(locale: string): string {
  return locale === DEFAULT ? '' : `.${locale}`;
}

/** `(home)/get-started/set-up` + `en` -> `(home)/get-started/set-up.en.mdx` */
export function toDocPath(slug: string, locale: string): string {
  return `${slug}${suffix(locale)}.mdx`;
}

/** 目录 `(home)` + `zh` -> `(home)/meta.zh.json`; 根目录传空串 */
export function toMetaPath(dir: string, locale: string): string {
  const name = `meta${suffix(locale)}.json`;
  return dir ? `${dir}/${name}` : name;
}

export function fromDocPath(path: string): { slug: string; locale: string } {
  const base = path.replace(/\.mdx$/, '');
  const dot = base.lastIndexOf('.');
  const tail = dot === -1 ? '' : base.slice(dot + 1);
  return LOCALES.has(tail)
    ? { slug: base.slice(0, dot), locale: tail }
    : { slug: base, locale: DEFAULT };
}

export function fromMetaPath(path: string): { dir: string; locale: string } {
  const slash = path.lastIndexOf('/');
  const dir = slash === -1 ? '' : path.slice(0, slash);
  const name = path.slice(slash + 1).replace(/\.json$/, ''); // meta / meta.en
  const dot = name.indexOf('.');
  const tail = dot === -1 ? '' : name.slice(dot + 1);
  return { dir, locale: LOCALES.has(tail) ? tail : DEFAULT };
}
