import { AppShell } from '@/components/admin/app-shell';
import type { CommandItem } from '@/components/admin/command-palette';
import { logout } from '@/lib/admin/actions/auth';
import { requireUser } from '@/lib/auth/guard';
import { listSlugs } from '@/lib/cms/content';

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const commands: CommandItem[] = [
    { id: 'nav:content', title: '内容列表', href: '/admin/content', group: '前往' },
    { id: 'nav:navigation', title: '导航结构', href: '/admin/navigation', group: '前往' },
    ...(user.role === 'admin'
      ? [{ id: 'nav:users', title: '账号管理', href: '/admin/users', group: '前往' }]
      : []),
    { id: 'nav:account', title: '我的账号', href: '/admin/account', group: '前往' },
    ...listSlugs().map((entry) => ({
      id: `doc:${entry.slug}`,
      title: entry.title,
      detail: entry.slug,
      href: `/admin/content/${entry.slug}`,
      group: '文档',
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
