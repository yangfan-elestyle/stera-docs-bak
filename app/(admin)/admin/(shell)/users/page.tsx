import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { UsersPanel, type UserRow } from '@/components/admin/users-panel';
import { requireAdmin } from '@/lib/auth/guard';
import { listUsers } from '@/lib/auth/users';

export const metadata: Metadata = { title: '账号' };

export default async function UsersPage() {
  const me = await requireAdmin();
  const rows: UserRow[] = listUsers().map((user) => ({
    id: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.getTime(),
  }));

  return (
    <>
      <PageHeader title="账号" description="管理员可创建带编辑权限的账号, 账号名即邮箱。" />
      <div className="px-4 py-5 md:px-6">
        <UsersPanel rows={rows} meId={me.id} />
      </div>
    </>
  );
}
