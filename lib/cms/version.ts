import { getDb } from './db';

/**
 * SQLite trigger 维护单调 revision; 同毫秒 / 非最大时间戳行的改动同样失效。
 */
export function contentVersion(): string {
  const row = getDb()
    .prepare('SELECT revision FROM content_state WHERE id = 1')
    .get() as { revision: number };
  return String(row.revision);
}
