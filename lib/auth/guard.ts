import { redirect } from 'next/navigation';
import { getAdminT } from '@/lib/admin/i18n/server';
import { countUsers, createUser } from './users';
import { getSessionUser } from './session';
import type { User } from './users';

/**
 * 账号表为空时建默认 admin; createUser 标记 mustChangePassword, 首次登录强制改密。
 *
 * MUST NOT 开放自助注册或「首次访问即成为管理员」的 setup 页: mdx 默认允许代码执行,
 * 拿到编辑权 = 能在服务端跑代码。
 */
function bootstrapAdmin(): void {
  if (countUsers() > 0) return;
  createUser({ email: 'admin@sterasmartone.com', password: '123456', role: 'admin' });
}

export async function currentUser(): Promise<User | undefined> {
  // 先读取请求 cookie, 让构建期静态探测退出; 初始化账号只能发生在真实请求中。
  const user = await getSessionUser();
  bootstrapAdmin();
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  return user;
}

/**
 * 写操作的守卫: 还在用管理员给的初始密码时一律拒绝。
 *
 * 强制改密 MUST NOT 放在 requireUser 里做重定向 —— 改密页本身在同一个受守卫的
 * 布局下, 那样会自己重定向到自己, 浏览器最后被弹回站点首页。
 * 引导由 AppShell 在客户端做, 这里是服务端的硬拦截。
 */
export async function requireWriter(): Promise<User> {
  const user = await requireUser();
  if (user.mustChangePassword) {
    throw new Error((await getAdminT())('error.mustChangePasswordFirst'));
  }
  return user;
}

/** 页面渲染用: 只判角色。初始密码的引导由 AppShell 做, 这里再拦会变成抛异常页。 */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== 'admin') redirect('/admin/content');
  return user;
}

/** 管理类写操作用: 角色 + 初始密码两道都要过。 */
export async function requireAdminWriter(): Promise<User> {
  const user = await requireWriter();
  if (user.role !== 'admin') {
    throw new Error((await getAdminT())('error.adminRequired'));
  }
  return user;
}
