import { parseFrontmatter } from '@fumadocs/mdx-remote';
import { i18n } from '@/lib/i18n';
import { docFrontmatterSchema, docMetaSchema } from '@/lib/content-schema';
import { getDb } from './db';

// locale 来自表单, 未经校验就写库会造出前台永远读不到的语言分支
function assertLocale(locale: string): void {
  if (!(i18n.languages as readonly string[]).includes(locale)) {
    throw new Error(`未知语言: ${locale}`);
  }
}

export interface DocEntry {
  slug: string;
  locale: string;
  content: string;
  updatedAt: Date;
}

export interface SlugSummary {
  slug: string;
  /** 已存在的语言; 缺哪几种一眼能看出来 */
  locales: string[];
  title: string;
  updatedAt: Date;
}

export function listSlugs(): SlugSummary[] {
  const rows = getDb()
    .prepare(
      `SELECT slug, locale, content, updated_at FROM docs
       ORDER BY slug, locale`,
    )
    .all() as unknown as {
    slug: string;
    locale: string;
    content: string;
    updated_at: number;
  }[];

  const map = new Map<string, SlugSummary>();
  for (const row of rows) {
    const entry = map.get(row.slug) ?? {
      slug: row.slug,
      locales: [],
      title: row.slug,
      updatedAt: new Date(0),
    };
    entry.locales.push(row.locale);
    // 标题优先取默认语言那份, 列表里才不会中英混排
    if (row.locale === i18n.defaultLanguage || entry.title === entry.slug) {
      const { frontmatter } = parseFrontmatter(row.content);
      const title = (frontmatter as { title?: unknown })?.title;
      if (typeof title === 'string' && title) entry.title = title;
    }
    const updated = new Date(row.updated_at);
    if (updated > entry.updatedAt) entry.updatedAt = updated;
    map.set(row.slug, entry);
  }

  return [...map.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getDoc(slug: string, locale: string): DocEntry | undefined {
  const row = getDb()
    .prepare('SELECT slug, locale, content, updated_at FROM docs WHERE slug = ? AND locale = ?')
    .get(slug, locale) as unknown as
    | { slug: string; locale: string; content: string; updated_at: number }
    | undefined;
  return row
    ? {
        slug: row.slug,
        locale: row.locale,
        content: row.content,
        updatedAt: new Date(row.updated_at),
      }
    : undefined;
}

/**
 * 保存前校验 frontmatter —— 这里是唯一真正的拦截点。
 * 读取侧 (lib/cms/source.ts) 只会跳过坏行并打日志, 靠它兜底等于让坏内容先落库再消失。
 */
export function validateDocSource(source: string): string | undefined {
  const { frontmatter } = parseFrontmatter(source);
  const parsed = docFrontmatterSchema.safeParse(frontmatter);
  if (parsed.success) return undefined;
  return parsed.error.issues
    .map((issue) => `${issue.path.join('.') || 'frontmatter'}: ${issue.message}`)
    .join('; ');
}

export function saveDoc(slug: string, locale: string, content: string): void {
  assertLocale(locale);

  getDb()
    .prepare(
      `INSERT INTO docs (slug, locale, content, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(slug, locale) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`,
    )
    .run(slug, locale, content, Date.now());
}

export function deleteDoc(slug: string, locale: string): void {
  getDb().prepare('DELETE FROM docs WHERE slug = ? AND locale = ?').run(slug, locale);
}

export interface NavEntry {
  dir: string;
  locale: string;
  data: string;
  updatedAt: Date;
}

export function listNav(): NavEntry[] {
  return (
    getDb()
      .prepare('SELECT dir, locale, data, updated_at FROM navigation ORDER BY dir, locale')
      .all() as unknown as {
      dir: string;
      locale: string;
      data: string;
      updated_at: number;
    }[]
  ).map((row) => ({
    dir: row.dir,
    locale: row.locale,
    data: row.data,
    updatedAt: new Date(row.updated_at),
  }));
}

export function getNav(dir: string, locale: string): NavEntry | undefined {
  return listNav().find((entry) => entry.dir === dir && entry.locale === locale);
}

/** meta 的 sectionNotes 是非标准字段, schema 里显式带着, 漏掉侧边栏分段描述会静默消失。 */
export function validateNavSource(json: string): string | undefined {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(json);
  } catch (error) {
    return `JSON 语法错误: ${(error as Error).message}`;
  }
  const parsed = docMetaSchema.safeParse(parsedJson);
  if (parsed.success) return undefined;
  return parsed.error.issues
    .map((issue) => `${issue.path.join('.') || 'meta'}: ${issue.message}`)
    .join('; ');
}

export function saveNav(dir: string, locale: string, json: string): void {
  assertLocale(locale);

  getDb()
    .prepare(
      `INSERT INTO navigation (dir, locale, data, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(dir, locale) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    )
    .run(dir, locale, json, Date.now());
}
