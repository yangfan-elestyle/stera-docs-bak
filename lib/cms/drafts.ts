import { getDb } from './db';

export interface Draft {
  content: string;
  updatedAt: Date;
}

export function saveDraft(
  userId: string,
  slug: string,
  locale: string,
  content: string,
): void {
  getDb()
    .prepare(
      `INSERT INTO drafts (user_id, slug, locale, content, updated_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, slug, locale) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`,
    )
    .run(userId, slug, locale, content, Date.now());
}

export function getDraft(
  userId: string,
  slug: string,
  locale: string,
): Draft | undefined {
  const row = getDb()
    .prepare(
      'SELECT content, updated_at FROM drafts WHERE user_id = ? AND slug = ? AND locale = ?',
    )
    .get(userId, slug, locale) as unknown as
    | { content: string; updated_at: number }
    | undefined;
  return row ? { content: row.content, updatedAt: new Date(row.updated_at) } : undefined;
}

export function clearDraft(userId: string, slug: string, locale: string): void {
  getDb()
    .prepare('DELETE FROM drafts WHERE user_id = ? AND slug = ? AND locale = ?')
    .run(userId, slug, locale);
}

/** 我的未保存草稿, 概要页用 */
export function listDrafts(userId: string): {
  slug: string;
  locale: string;
  updatedAt: Date;
}[] {
  return (
    getDb()
      .prepare(
        'SELECT slug, locale, updated_at FROM drafts WHERE user_id = ? ORDER BY updated_at DESC',
      )
      .all(userId) as unknown as { slug: string; locale: string; updated_at: number }[]
  ).map((row) => ({
    slug: row.slug,
    locale: row.locale,
    updatedAt: new Date(row.updated_at),
  }));
}
