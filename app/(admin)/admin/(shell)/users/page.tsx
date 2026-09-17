import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { UsersPanel, type UserRow } from '@/components/admin/users-panel';
import { getAdminI18n } from '@/lib/admin/i18n/server';
import { requireAdmin } from '@/lib/auth/guard';
import { listUsers } from '@/lib/auth/users';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminI18n();
  return { title: t('users.title') };
}

export default async function UsersPage() {
  const me = await requireAdmin();
  const { t } = await getAdminI18n();
  const rows: UserRow[] = listUsers().map((user) => ({
    id: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.getTime(),
  }));

  return (
    <>
      <PageHeader title={t('users.title')} description={t('users.desc')} />
      <div className="px-4 py-5 md:px-6">
        <UsersPanel rows={rows} meId={me.id} />
      </div>
    </>
  );
}
