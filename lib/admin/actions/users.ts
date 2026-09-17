'use server';

import { requireAdminWriter } from '@/lib/auth/guard';
import {
  PASSWORD_MIN_LENGTH,
  checkPasswordStrength,
  type PasswordIssue,
} from '@/lib/auth/password';
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
import { getAdminT } from '@/lib/admin/i18n/server';
import type { T } from '@/lib/admin/i18n';

export type UserResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

function passwordError(issue: PasswordIssue, t: T): string {
  return issue === 'tooShort'
    ? t('error.passwordTooShort', { min: PASSWORD_MIN_LENGTH })
    : t('error.passwordWeak');
}

export async function createAccountAction(input: {
  email: string;
  password: string;
  role: Role;
}): Promise<UserResult> {
  await requireAdminWriter();
  const t = await getAdminT();

  const email = normalizeEmail(input.email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { ok: false, error: t('error.badEmail') };
  if (input.role !== 'admin' && input.role !== 'editor')
    return { ok: false, error: t('error.badRole') };
  const weak = checkPasswordStrength(input.password);
  if (weak) return { ok: false, error: passwordError(weak, t) };
  if (findUserWithHash(email)) return { ok: false, error: t('error.emailExists') };

  createUser({ email, password: input.password, role: input.role });
  return { ok: true, message: t('ok.userCreated', { email }) };
}

export async function updateRoleAction(input: {
  id: string;
  role: Role;
}): Promise<UserResult> {
  const me = await requireAdminWriter();
  const t = await getAdminT();
  if (input.role !== 'admin' && input.role !== 'editor')
    return { ok: false, error: t('error.badRole') };
  if (input.id === me.id && input.role !== 'admin') {
    return { ok: false, error: t('error.noDowngradeSelf') };
  }
  const target = findUserById(input.id);
  if (!target) return { ok: false, error: t('error.userNotFound') };
  if (target.role === 'admin' && input.role !== 'admin' && countAdmins() <= 1) {
    return { ok: false, error: t('error.lastAdmin') };
  }

  setRole(input.id, input.role);
  return { ok: true, message: t('ok.roleUpdated') };
}

export async function resetPasswordAction(input: {
  id: string;
  password: string;
}): Promise<UserResult> {
  await requireAdminWriter();
  const t = await getAdminT();
  const weak = checkPasswordStrength(input.password);
  if (weak) return { ok: false, error: passwordError(weak, t) };
  const target = findUserById(input.id);
  if (!target) return { ok: false, error: t('error.userNotFound') };

  // 重置即踢下线: 否则对方旧会话还能继续用旧凭据操作
  setPassword(input.id, input.password, true);
  revokeUserSessions(input.id);
  return { ok: true, message: t('ok.passwordReset', { email: target.email }) };
}

export async function deleteAccountAction(input: {
  id: string;
}): Promise<UserResult> {
  const me = await requireAdminWriter();
  const t = await getAdminT();
  if (input.id === me.id) return { ok: false, error: t('error.noDeleteSelf') };
  const target = findUserById(input.id);
  if (!target) return { ok: false, error: t('error.userNotFound') };
  if (target.role === 'admin' && countAdmins() <= 1) {
    return { ok: false, error: t('error.lastAdmin') };
  }

  deleteUser(input.id);
  return { ok: true, message: t('ok.userDeleted', { email: target.email }) };
}
