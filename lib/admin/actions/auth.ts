'use server';

import { redirect } from 'next/navigation';
import {
  createSession,
  destroySession,
  revokeUserSessions,
} from '@/lib/auth/session';
import { currentUser } from '@/lib/auth/guard';
import { checkPasswordStrength, verifyPassword } from '@/lib/auth/password';
import { findUserWithHash, setPassword } from '@/lib/auth/users';

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
  redirect(user.mustChangePassword ? '/admin/account' : '/admin');
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
  if (next === current) return { error: '新密码不能与当前密码相同' };
  if (next !== confirm) return { error: '两次输入的新密码不一致' };
  const weak = checkPasswordStrength(next);
  if (weak) return { error: weak };

  setPassword(user.id, next, false);
  // 改密即踢掉全部旧会话, 再给自己发一张新的
  revokeUserSessions(user.id);
  await createSession(user.id);
  return { ok: '密码已更新, 其他设备上的登录状态已全部失效' };
}
