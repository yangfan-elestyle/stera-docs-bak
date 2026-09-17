import { createHash, randomBytes } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { getDb } from '@/lib/cms/db';
import { getRequestHost, getRequestProtocol } from '@/lib/request';
import { findUserById, type User } from './users';

const COOKIE = 'stera_admin_session';
const TTL_MS = 12 * 60 * 60 * 1000; // 12h

// 库里只存 token 的 sha256: 库被读走也换不出一个能用的 cookie。
function digest(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const now = Date.now();

  getDb()
    .prepare(
      'INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
    )
    .run(digest(token), userId, now + TTL_MS, now);

  // Secure 跟请求协议走, 不跟 NODE_ENV: 镜像里 NODE_ENV 恒为 production, 而内网预览站
  // (http://<host>.local:3000) 是 http 源, 浏览器会把带 Secure 的 cookie 直接丢掉 ->
  // 登录看着成功, 下一个请求就没有会话, 每次操作都退回登录页。
  const secure = getRequestProtocol(getRequestHost(await headers())) === 'https';

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: Math.floor(TTL_MS / 1000),
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    getDb()
      .prepare('DELETE FROM sessions WHERE token_hash = ?')
      .run(digest(token));
  }
  store.delete(COOKIE);
}

/** 当前登录用户; 未登录 / 会话过期返回 undefined。顺手清掉过期会话行。 */
export async function getSessionUser(): Promise<User | undefined> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return undefined;

  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());

  const row = db
    .prepare(
      'SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ?',
    )
    .get(digest(token), Date.now()) as unknown as
    | { user_id: string }
    | undefined;

  return row ? findUserById(row.user_id) : undefined;
}

export function revokeUserSessions(userId: string): void {
  getDb().prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}
