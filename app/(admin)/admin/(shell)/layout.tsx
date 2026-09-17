import { AppShell } from '@/components/admin/app-shell';
import type { CommandItem } from '@/components/admin/command-palette';
import { logout } from '@/lib/admin/actions/auth';
import { getAdminI18n } from '@/lib/admin/i18n/server';
import { requireUser } from '@/lib/auth/guard';
import { listSlugs } from '@/lib/cms/content';

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const { t } = await getAdminI18n();
  const goto = t('palette.groupGoto');

  const commands: CommandItem[] = [
    { id: 'nav:content', title: t('palette.cmdContent'), href: '/admin/content', group: goto },
    ...(user.role === 'admin'
      ? [{ id: 'nav:users', title: t('palette.cmdUsers'), href: '/admin/users', group: goto }]
      : []),
    { id: 'nav:account', title: t('shell.myAccount'), href: '/admin/account', group: goto },
    ...listSlugs().map((entry) => ({
      id: `doc:${entry.slug}`,
      title: entry.title,
      detail: entry.slug,
      href: `/admin/content/${entry.slug}`,
      group: t('palette.groupDocs'),
      // 三种语言的标题都参与匹配, 用日文标题也能搜到中文页
      keywords: Object.values(entry.titles).join(' '),
    })),
  ];

  return (
    <AppShell user={{
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      }} commands={commands} logoutAction={logout}>
      {children}
    </AppShell>
  );
}
