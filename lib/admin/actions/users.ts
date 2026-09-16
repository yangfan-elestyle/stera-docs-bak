'use server';

import { requireAdminWriter } from '@/lib/auth/guard';
import { checkPasswordStrength } from '@/lib/auth/password';
import { revokeUserSessions } from '@/lib/auth/session';
import {
  countAdmins,
  createUser,
  deleteUser,
  findUserById,
  findUserWithHash,
  normalizeEmail,
  setPassword,
  setRole,
  type Role,
} from '@/lib/auth/users';

export type UserResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function createAccountAction(input: {
  email: string;
  password: string;
  role: Role;
}): Promise<UserResult> {
  await requireAdminWriter();

  const email = normalizeEmail(input.email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { ok: false, error: '邮箱格式不正确' };
  if (input.role !== 'admin' && input.role !== 'editor')
    return { ok: false, error: '角色不合法' };
  const weak = checkPasswordStrength(input.password);
  if (weak) return { ok: false, error: weak };
  if (findUserWithHash(email)) return { ok: false, error: '该邮箱已存在' };

  createUser({ email, password: input.password, role: input.role });
  return { ok: true, message: `${email} 已创建, 对方首次登录会被强制改密` };
}

export async function updateRoleAction(input: {
  id: string;
  role: Role;
}): Promise<UserResult> {
  const me = await requireAdminWriter();
  if (input.role !== 'admin' && input.role !== 'editor')
    return { ok: false, error: '角色不合法' };
  if (input.id === me.id && input.role !== 'admin') {
    return { ok: false, error: '不能降级当前登录的账号' };
  }
  const target = findUserById(input.id);
  if (!target) return { ok: false, error: '账号不存在' };
  if (target.role === 'admin' && input.role !== 'admin' && countAdmins() <= 1) {
    return { ok: false, error: '至少保留一个管理员' };
  }

  setRole(input.id, input.role);
  return { ok: true, message: '角色已更新' };
}

export async function resetPasswordAction(input: {
  id: string;
  password: string;
}): Promise<UserResult> {
  await requireAdminWriter();
  const weak = checkPasswordStrength(input.password);
  if (weak) return { ok: false, error: weak };
  const target = findUserById(input.id);
  if (!target) return { ok: false, error: '账号不存在' };

  // 重置即踢下线: 否则对方旧会话还能继续用旧凭据操作
  setPassword(input.id, input.password, true);
  revokeUserSessions(input.id);
  return {
    ok: true,
    message: `${target.email} 的密码已重置, 对方需重新登录并改密`,
  };
}

export async function deleteAccountAction(input: {
  id: string;
}): Promise<UserResult> {
  const me = await requireAdminWriter();
  if (input.id === me.id) return { ok: false, error: '不能删除当前登录的账号' };
  const target = findUserById(input.id);
  if (!target) return { ok: false, error: '账号不存在' };
  if (target.role === 'admin' && countAdmins() <= 1) {
    return { ok: false, error: '至少保留一个管理员' };
  }

  deleteUser(input.id);
  return { ok: true, message: `${target.email} 已删除` };
}
