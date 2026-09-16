'use server';

import { redirect } from 'next/navigation';
import { createSession, destroySession, revokeUserSessions } from '@/lib/auth/session';
import { currentUser, requireAdmin, requireUser } from '@/lib/auth/guard';
import {
  checkPasswordStrength,
  verifyPassword,
} from '@/lib/auth/password';
import {
  countAdmins,
  createUser,
  deleteUser,
  findUserWithHash,
  normalizeEmail,
  setPassword,
  setRole,
  type Role,
} from '@/lib/auth/users';
import {
  saveDoc,
  saveNav,
  validateDocSource,
  validateNavSource,
} from '@/lib/cms/content';
import { revalidateContent } from '@/lib/cms/revalidate';

export type FormState = { error?: string; ok?: string };

export async function login(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const user = findUserWithHash(email);
  // 用户不存在与密码错误返回同一句: 否则接口变成账号枚举器
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: '邮箱或密码不正确' };
  }

  await createSession(user.id);
  redirect(user.mustChangePassword ? '/admin/password' : '/admin/content');
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}

export async function changePassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await currentUser();
  if (!user) redirect('/admin/login');

  const current = String(formData.get('current') ?? '');
  const next = String(formData.get('next') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  const stored = findUserWithHash(user.email);
  if (!stored || !verifyPassword(current, stored.passwordHash)) {
    return { error: '当前密码不正确' };
  }
  if (next !== confirm) return { error: '两次输入的新密码不一致' };
  const weak = checkPasswordStrength(next);
  if (weak) return { error: weak };

  setPassword(user.id, next, false);
  // 改密即踢掉全部旧会话, 再给自己发一张新的
  revokeUserSessions(user.id);
  await createSession(user.id);
  redirect('/admin/content');
}

export async function createAccount(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const email = normalizeEmail(String(formData.get('email') ?? ''));
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? 'editor') as Role;

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: '邮箱格式不正确' };
  if (role !== 'admin' && role !== 'editor') return { error: '角色不合法' };
  const weak = checkPasswordStrength(password);
  if (weak) return { error: weak };
  if (findUserWithHash(email)) return { error: '该邮箱已存在' };

  createUser({ email, password, role });
  return { ok: `已创建 ${email}, 初始密码请线下交给本人, 对方首次登录会被强制改密` };
}

export async function removeAccount(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  const id = String(formData.get('id') ?? '');

  if (id === admin.id) return { error: '不能删除当前登录的账号' };
  const target = String(formData.get('role') ?? '');
  if (target === 'admin' && countAdmins() <= 1) {
    return { error: '至少保留一个管理员' };
  }

  deleteUser(id);
  return { ok: '已删除' };
}

export async function updateRole(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const role = String(formData.get('role') ?? '') as Role;

  if (role !== 'admin' && role !== 'editor') return { error: '角色不合法' };
  if (id === admin.id && role !== 'admin') return { error: '不能降级当前登录的账号' };

  setRole(id, role);
  return { ok: '已更新' };
}

export async function saveDocAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const slug = String(formData.get('slug') ?? '');
  const locale = String(formData.get('locale') ?? '');
  const content = String(formData.get('content') ?? '');

  if (!slug || !locale) return { error: '缺少 slug 或语言' };
  // 唯一的拦截点: 读取侧只会跳过坏行, 靠它兜底等于坏内容先落库再整页消失
  const invalid = validateDocSource(content);
  if (invalid) return { error: `frontmatter 不合法 —— ${invalid}` };

  saveDoc(slug, locale, content);
  revalidateContent();
  return { ok: `已保存 ${locale}` };
}

export async function saveNavAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const dir = String(formData.get('dir') ?? '');
  const locale = String(formData.get('locale') ?? '');
  const json = String(formData.get('data') ?? '');

  if (!locale) return { error: '缺少语言' };
  const invalid = validateNavSource(json);
  if (invalid) return { error: `meta 不合法 —— ${invalid}` };

  saveNav(dir, locale, json);
  revalidateContent();
  return { ok: `已保存 ${locale}` };
}
