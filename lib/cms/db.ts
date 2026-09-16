import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import * as path from 'node:path';
import { loadSeedSync, SEED_DOCS } from './provider';
import { fromDocPath, fromMetaPath } from './paths';

// 路径写死常量, 不走 env: 线上由 k8s 把持久卷挂到 /app/data, standalone 的 cwd 就是 /app,
// 本机则是仓库根的 data/ (已 gitignore + dockerignore)。挂载点决定位置, 没有第二种可能。
export const DB_PATH = path.join(process.cwd(), 'data', 'cms.db');

// 一条 migration 一个数组元素, 用 PRAGMA user_version 记进度 -> 可重复执行且结果一致。
// 追加时 MUST 往尾部加, MUST NOT 改已发布的元素。
const MIGRATIONS: string[] = [
  `
  -- 正文: 每个 slug 每种语言各一行, 互不派生
  CREATE TABLE docs (
    slug       TEXT    NOT NULL,   -- 无语言后缀的虚拟路径, 如 (home)/get-started/set-up
    locale     TEXT    NOT NULL,   -- ja / en / zh
    content    TEXT    NOT NULL,   -- 原始 mdx, 含 frontmatter
    updated_at INTEGER NOT NULL,   -- epoch ms
    PRIMARY KEY (slug, locale)
  ) WITHOUT ROWID;

  -- 导航: meta*.json 同样按语言三份; data 原样存 JSON, 含非标准字段 sectionNotes
  CREATE TABLE navigation (
    dir        TEXT    NOT NULL,   -- meta 所在目录, 根目录为空串
    locale     TEXT    NOT NULL,
    data       TEXT    NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (dir, locale)
  ) WITHOUT ROWID;
  `,
  `
  -- 账号: 账号名即邮箱, 由 admin 在后台直接创建, 不接邮件服务 / 不开放自助注册。
  -- 能写内容 = 能在服务端执行代码 (mdx 允许代码执行), 故按 RCE 边界管, 不是普通内容权限。
  CREATE TABLE users (
    id                   TEXT    NOT NULL PRIMARY KEY,
    email                TEXT    NOT NULL UNIQUE,
    password_hash        TEXT    NOT NULL,
    role                 TEXT    NOT NULL CHECK (role IN ('admin', 'editor')),
    must_change_password INTEGER NOT NULL DEFAULT 0,
    created_at           INTEGER NOT NULL,
    updated_at           INTEGER NOT NULL
  );

  -- 会话: 存 token 的 sha256, 泄库也拿不到可用 cookie
  CREATE TABLE sessions (
    token_hash TEXT    NOT NULL PRIMARY KEY,
    user_id    TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX sessions_user_id ON sessions(user_id);
  `,
];

let instance: DatabaseSync | undefined;

/**
 * MUST 懒加载: 模块加载即连库会让 next build 在构建机上凭空造出 data/cms.db,
 * 而线上的库在运行期挂载卷上, 构建机根本看不到 —— 构建期 MUST NOT 碰它。
 * MUST 单例: dev HMR 下每请求新建句柄会泄漏。
 *
 * node:sqlite 全同步, 所以「开库 -> migrate -> 空库则灌 seed」在同一个 tick 内完成,
 * 不需要额外的并发守卫。
 */
export function getDb(): DatabaseSync {
  if (instance) return instance;

  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  // WAL: 读写不互相阻塞。前提是块存储本地卷, 网络文件系统 (NFS / EFS) 上文件锁会坏库。
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA busy_timeout = 5000');
  db.exec('PRAGMA foreign_keys = ON');

  migrate(db);
  if (countDocs(db) === 0) importSeed(db);

  instance = db;
  return instance;
}

export function migrate(db: DatabaseSync): void {
  const row = db.prepare('PRAGMA user_version').get() as { user_version: number };
  for (let v = row.user_version; v < MIGRATIONS.length; v++) db.exec(MIGRATIONS[v]);
  db.exec(`PRAGMA user_version = ${MIGRATIONS.length}`);
}

export function countDocs(db: DatabaseSync): number {
  return (db.prepare('SELECT count(*) AS n FROM docs').get() as { n: number }).n;
}

/**
 * 灌入随仓 seed。清空重灌, 不做增量与幂等 —— seed 只在「新建库」这一个场景用。
 *
 * 本机 `bun run import:seed` 与新建卷首次启动走的是同一个函数, 分两份实现必然漂移。
 */
export function importSeed(db: DatabaseSync): void {
  const { docs, metas } = loadSeedSync();

  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM docs');
    db.exec('DELETE FROM navigation');

    const insertDoc = db.prepare(
      'INSERT INTO docs (slug, locale, content, updated_at) VALUES (?, ?, ?, ?)',
    );
    for (const record of docs) {
      const { slug, locale } = fromDocPath(record.path);
      insertDoc.run(
        slug,
        locale,
        record.source,
        record.updatedAt?.getTime() ?? Date.now(),
      );
    }

    const insertMeta = db.prepare(
      'INSERT INTO navigation (dir, locale, data, updated_at) VALUES (?, ?, ?, ?)',
    );
    for (const record of metas) {
      const { dir, locale } = fromMetaPath(record.path);
      insertMeta.run(
        dir,
        locale,
        JSON.stringify(record.data),
        record.updatedAt?.getTime() ?? Date.now(),
      );
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  // 大声失败: 镜像里漏带 seed/ 的话, 站点会只剩 openapi 一个 tab 且毫无线索。
  if (countDocs(db) === 0) {
    throw new Error(
      `[cms] seed 导入后 docs 表仍为空, 检查 ${SEED_DOCS} 是否随镜像一起进了运行阶段`,
    );
  }
}
