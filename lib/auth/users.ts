import { randomUUID } from 'node:crypto';
import { getDb } from '@/lib/cms/db';
import { hashPassword } from './password';

export type Role = 'admin' | 'editor';

export interface User {
  id: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  must_change_password: number;
  created_at: number;
  updated_at: number;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    mustChangePassword: row.must_change_password === 1,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// 账号名即邮箱, 统一小写存: 大小写不同的同一邮箱注册两次会让「谁能改内容」失去唯一答案。
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function countUsers(): number {
  return (getDb().prepare('SELECT count(*) AS n FROM users').get() as { n: number })
    .n;
}

export function listUsers(): User[] {
  return (
    getDb()
      .prepare('SELECT * FROM users ORDER BY created_at')
      .all() as unknown as UserRow[]
  ).map(toUser);
}

export function findUserById(id: string): User | undefined {
  const row = getDb()
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(id) as unknown as UserRow | undefined;
  return row ? toUser(row) : undefined;
}

export function findUserWithHash(
  email: string,
): (User & { passwordHash: string }) | undefined {
  const row = getDb()
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(normalizeEmail(email)) as unknown as UserRow | undefined;
  return row ? { ...toUser(row), passwordHash: row.password_hash } : undefined;
}

/**
 * admin 直接建号并当场设定初始密码, 由 admin 线下交给本人。
 * 不接邮件服务 -> 没有邀请信 / 邮箱验证 / 找回密码这三条路。
 * 初始密码一律标记 mustChangePassword, 首次登录强制改掉。
 */
export function createUser(input: {
  email: string;
  password: string;
  role: Role;
}): User {
  const now = Date.now();
  const user: UserRow = {
    id: randomUUID(),
    email: normalizeEmail(input.email),
    password_hash: hashPassword(input.password),
    role: input.role,
    must_change_password: 1,
    created_at: now,
    updated_at: now,
  };
  getDb()
    .prepare(
      `INSERT INTO users (id, email, password_hash, role, must_change_password, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      user.id,
      user.email,
      user.password_hash,
      user.role,
      user.must_change_password,
      user.created_at,
      user.updated_at,
    );
  return toUser(user);
}

export function setPassword(
  userId: string,
  password: string,
  mustChange = false,
): void {
  getDb()
    .prepare(
      'UPDATE users SET password_hash = ?, must_change_password = ?, updated_at = ? WHERE id = ?',
    )
    .run(hashPassword(password), mustChange ? 1 : 0, Date.now(), userId);
}

export function setRole(userId: string, role: Role): void {
  getDb()
    .prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?')
    .run(role, Date.now(), userId);
}

export function deleteUser(userId: string): void {
  // sessions 有 ON DELETE CASCADE, 删号即刻踢掉其所有会话
  getDb().prepare('DELETE FROM users WHERE id = ?').run(userId);
}

export function countAdmins(): number {
  return (
    getDb()
      .prepare("SELECT count(*) AS n FROM users WHERE role = 'admin'")
      .get() as { n: number }
  ).n;
}
