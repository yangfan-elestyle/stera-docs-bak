import { redirect } from 'next/navigation';
import { countUsers, createUser } from './users';
import { getSessionUser } from './session';
import type { User } from './users';

/**
 * 首个 admin 只能来自部署侧注入的 ADMIN_EMAIL / ADMIN_PASSWORD, 且只在账号表为空时生效。
 *
 * MUST NOT 开放自助注册或「首次访问即成为管理员」的 setup 页: mdx 默认允许代码执行,
 * 拿到编辑权 = 能在服务端跑代码, 两者都会留出一个任何人都能抢注的窗口。
 */
function bootstrapAdmin(): void {
  if (countUsers() > 0) return;
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  createUser({ email, password, role: 'admin' });
}

export async function currentUser(): Promise<User | undefined> {
  bootstrapAdmin();
  return getSessionUser();
}

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  if (user.mustChangePassword) redirect('/admin/password');
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== 'admin') redirect('/admin/content');
  return user;
}
