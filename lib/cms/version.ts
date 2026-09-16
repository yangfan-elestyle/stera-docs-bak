import { getDb } from './db';

/**
 * 内容版本指纹: 最后修改时间 + 行数, 编辑 / 新增 / 删除都会让它变。
 * 取 max + count 而不是单看时间戳 —— 只删不改时时间戳不动, 只看它会漏。
 */
export function contentVersion(): string {
  const row = getDb()
    .prepare(
      `SELECT
         (SELECT COALESCE(max(updated_at), 0) FROM docs)        AS d,
         (SELECT count(*)                     FROM docs)        AS dn,
         (SELECT COALESCE(max(updated_at), 0) FROM navigation)  AS m,
         (SELECT count(*)                     FROM navigation)  AS mn`,
    )
    .get() as unknown as { d: number; dn: number; m: number; mn: number };
  return `${row.d}:${row.dn}:${row.m}:${row.mn}`;
}
