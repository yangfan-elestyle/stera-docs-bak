import { parseFrontmatter } from '@fumadocs/mdx-remote';
import { i18n } from '@/lib/i18n';
import { docFrontmatterSchema, docMetaSchema } from '@/lib/content-schema';
import { getDb } from './db';
import { CmsError, type NavIssue } from './errors';

// locale 来自表单, 未经校验就写库会造出前台永远读不到的语言分支
function assertLocale(locale: string): void {
  if (!(i18n.languages as readonly string[]).includes(locale)) {
    throw new CmsError('unknownLocale', { locale });
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
  /** 所属分区 = slug 第一个非 route-group 段, 列表按它分组 */
  section: string;
  /** 已存在的语言; 缺哪几种一眼能看出来 */
  locales: string[];
  /** 各语言标题, 用于搜索与缺失提示 */
  titles: Record<string, string>;
  title: string;
  chars: number;
  updatedAt: Date;
}

function sectionOf(slug: string): string {
  const parts = slug.split('/').filter((part) => !/^\(.*\)$/.test(part));
  return parts.length > 1 ? parts[0] : '顶层';
}

function titleOf(content: string): string | undefined {
  const { frontmatter } = parseFrontmatter(content);
  const title = (frontmatter as { title?: unknown })?.title;
  return typeof title === 'string' && title ? title : undefined;
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
      section: sectionOf(row.slug),
      locales: [],
      titles: {},
      title: row.slug,
      chars: 0,
      updatedAt: new Date(0),
    };
    entry.locales.push(row.locale);
    const title = titleOf(row.content);
    if (title) entry.titles[row.locale] = title;
    if (row.locale === i18n.defaultLanguage) {
      entry.chars = row.content.length;
      if (title) entry.title = title;
    }
    const updated = new Date(row.updated_at);
    if (updated > entry.updatedAt) entry.updatedAt = updated;
    map.set(row.slug, entry);
  }

  for (const entry of map.values()) {
    if (entry.title === entry.slug) {
      // 默认语言缺失时退而取任意一种语言的标题, 别在列表里显示裸 slug
      entry.title = Object.values(entry.titles)[0] ?? entry.slug;
    }
  }

  return [...map.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

export function slugExists(slug: string): boolean {
  return (
    (
      getDb()
        .prepare('SELECT count(*) AS n FROM docs WHERE slug = ?')
        .get(slug) as {
        n: number;
      }
    ).n > 0
  );
}

/** 一个 slug 的全部语言版本, 缺失的语言返回 undefined */
export function getSlugDocs(
  slug: string,
): Record<string, DocEntry | undefined> {
  const out: Record<string, DocEntry | undefined> = {};
  for (const locale of i18n.languages) out[locale] = getDoc(slug, locale);
  return out;
}

export function getDoc(slug: string, locale: string): DocEntry | undefined {
  const row = getDb()
    .prepare(
      'SELECT slug, locale, content, updated_at FROM docs WHERE slug = ? AND locale = ?',
    )
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
    .map(
      (issue) => `${issue.path.join('.') || 'frontmatter'}: ${issue.message}`,
    )
    .join('; ');
}

export class StaleWriteError extends Error {
  constructor(readonly current: Date) {
    // message 落错误码: 调用方一律按 instanceof 分支处理, 这串只进日志
    super('staleWrite');
  }
}

/**
 * @param expectedUpdatedAt 打开编辑器时看到的时间戳; 与库里不一致说明中途被别人改过。
 *   三种语言的编辑器同页常开, 隔一阵再保存会把别人的改动整段盖掉, 这里挡一道。
 */
export function saveDoc(
  slug: string,
  locale: string,
  content: string,
  expectedUpdatedAt?: number,
): Date {
  assertLocale(locale);

  const existing = getDoc(slug, locale);
  if (
    existing &&
    expectedUpdatedAt !== undefined &&
    existing.updatedAt.getTime() !== expectedUpdatedAt
  ) {
    throw new StaleWriteError(existing.updatedAt);
  }

  const now = Date.now();
  getDb()
    .prepare(
      `INSERT INTO docs (slug, locale, content, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(slug, locale) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`,
    )
    .run(slug, locale, content, now);
  return new Date(now);
}

export function deleteDoc(slug: string, locale: string): void {
  getDb()
    .prepare('DELETE FROM docs WHERE slug = ? AND locale = ?')
    .run(slug, locale);
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
      .prepare(
        'SELECT dir, locale, data, updated_at FROM navigation ORDER BY dir, locale',
      )
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
  return listNav().find(
    (entry) => entry.dir === dir && entry.locale === locale,
  );
}

/** meta 的 sectionNotes 是非标准字段, schema 里显式带着, 漏掉侧边栏分段描述会静默消失。 */
export function validateNavSource(json: string): NavIssue | undefined {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(json);
  } catch (error) {
    return { kind: 'json', detail: (error as Error).message };
  }
  const parsed = docMetaSchema.safeParse(parsedJson);
  if (parsed.success) return undefined;
  return {
    kind: 'schema',
    detail: parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'meta'}: ${issue.message}`)
      .join('; '),
  };
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

/* ------------------------------------------------------------------ *
 * 新建 / 删除页面
 * ------------------------------------------------------------------ */

/** slug 归属哪一份导航: 取「是它前缀」的最深那个 meta 目录 */
export function navDirFor(slug: string): string | undefined {
  const dirs = [...new Set(listNav().map((entry) => entry.dir))];
  return dirs
    .filter((dir) => dir === '' || slug === dir || slug.startsWith(`${dir}/`))
    .sort((a, b) => b.length - a.length)[0];
}

export function listNavDirs(): string[] {
  return [...new Set(listNav().map((entry) => entry.dir))].sort();
}

const TEMPLATE = (title: string) =>
  `---\ntitle: ${JSON.stringify(title)}\n---\n\n`;

export interface CreatePageInput {
  slug: string;
  title: string;
  locales: string[];
}

export function createPage(input: CreatePageInput): void {
  if (slugExists(input.slug)) throw new CmsError('slugExists');
  if (!/^[\w()\-./]+$/.test(input.slug)) throw new CmsError('slugInvalid');

  const db = getDb();
  db.exec('BEGIN');
  try {
    for (const locale of input.locales) {
      assertLocale(locale);
      saveDoc(input.slug, locale, TEMPLATE(input.title));
    }
    // 不挂进导航的话页面存在但侧边栏看不到 —— meta 里写了 pages 就只显示列出的条目
    const dir = navDirFor(input.slug);
    if (dir !== undefined) {
      const entry = dir === '' ? input.slug : input.slug.slice(dir.length + 1);
      for (const nav of listNav().filter((item) => item.dir === dir)) {
        const data = JSON.parse(nav.data) as { pages?: string[] };
        if (Array.isArray(data.pages) && !data.pages.includes(entry)) {
          data.pages.push(entry);
          saveNav(dir, nav.locale, JSON.stringify(data, null, 2));
        }
      }
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function deletePage(slug: string): void {
  const db = getDb();
  db.exec('BEGIN');
  try {
    db.prepare('DELETE FROM docs WHERE slug = ?').run(slug);
    db.prepare('DELETE FROM drafts WHERE slug = ?').run(slug);

    // 导航里留着孤儿条目会让侧边栏出现点不开的链接
    for (const nav of listNav()) {
      const data = JSON.parse(nav.data) as { pages?: string[] };
      if (!Array.isArray(data.pages)) continue;
      // dir 不是这个 slug 的前缀时, slice 出来的是一段无意义的字符, 可能正好撞上
      // 别的目录里某个真实条目而把它误删 —— 必须先判前缀
      if (nav.dir !== '' && !slug.startsWith(`${nav.dir}/`)) continue;
      const entry = nav.dir === '' ? slug : slug.slice(nav.dir.length + 1);
      const next = data.pages.filter((page) => page !== entry);
      if (next.length !== data.pages.length) {
        saveNav(
          nav.dir,
          nav.locale,
          JSON.stringify({ ...data, pages: next }, null, 2),
        );
      }
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
