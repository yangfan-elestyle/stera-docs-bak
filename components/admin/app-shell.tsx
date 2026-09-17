'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  BookText,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
  UserCog,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/admin/cn';
import type { AdminDictKey } from '@/lib/admin/i18n';
import { useT } from './i18n';
import { LocaleSwitcher } from './locale-switcher';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
} from './ui/primitives';
import type { CommandItem } from './command-palette';
import { CommandPalette } from './command-palette';

export interface ShellUser {
  email: string;
  role: 'admin' | 'editor';
  mustChangePassword: boolean;
}

interface NavItem {
  href: string;
  labelKey: AdminDictKey;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: '/admin', labelKey: 'nav.dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/content', labelKey: 'nav.content', icon: BookText },
  { href: '/admin/users', labelKey: 'nav.users', icon: Users, adminOnly: true },
];

export function AppShell({
  user,
  commands,
  logoutAction,
  children,
}: {
  user: ShellUser;
  commands: CommandItem[];
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // 引导在客户端做: 改密页与其他页共用这层布局, 在服务端守卫里重定向会指向自己。
  // 服务端的硬拦截在 requireWriter(), 绕过这里也写不进任何东西。
  const locked = user.mustChangePassword && pathname !== '/admin/account';
  useEffect(() => {
    if (locked) router.replace('/admin/account');
  }, [locked, router]);

  // 侧栏折叠状态存本地: 编辑长文时收起侧栏是常态, 每次刷新都弹回来很烦人
  useEffect(() => {
    setCollapsed(localStorage.getItem('admin:sidebar') === 'collapsed');
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      localStorage.setItem('admin:sidebar', prev ? 'expanded' : 'collapsed');
      return !prev;
    });
  };

  const items = NAV.filter((item) => !item.adminOnly || user.role === 'admin');

  return (
    <div className="flex min-h-screen bg-fd-background">
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-fd-border bg-fd-card/40 transition-[width] duration-200 md:flex',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <div className="flex h-14 items-center gap-2 px-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-fd-primary text-fd-primary-foreground">
            <BookText className="size-4" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">
                stera smart one
              </p>
              <p className="truncate text-[11px] leading-tight text-fd-muted-foreground">
                {t('shell.brandSubtitle')}
              </p>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-2">
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-fd-primary/10 text-fd-primary'
                    : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
                  collapsed && 'justify-center px-0',
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {!collapsed ? t(item.labelKey) : null}
              </Link>
            );
            return collapsed ? (
              <Tooltip key={item.href} content={t(item.labelKey)} side="right">
                {link}
              </Tooltip>
            ) : (
              link
            );
          })}
        </nav>

        <div className="px-2 pb-2">
          <Button
            variant="ghost"
            size={collapsed ? 'icon-sm' : 'sm'}
            onClick={toggleSidebar}
            className={cn('w-full', collapsed && 'mx-auto w-8')}
            aria-label={t(collapsed ? 'shell.expandSidebar' : 'shell.collapseSidebar')}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            {!collapsed ? <span className="ml-1">{t('common.collapse')}</span> : null}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-fd-border bg-fd-background/80 px-4 backdrop-blur-md">
          <nav className="flex items-center gap-1 overflow-x-auto md:hidden">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-2 py-1 text-xs font-medium',
                  pathname.startsWith(item.href)
                    ? 'bg-fd-primary/10 text-fd-primary'
                    : 'text-fd-muted-foreground',
                )}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="ml-auto flex h-8 items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-2.5 text-xs text-fd-muted-foreground shadow-sm transition-colors hover:bg-fd-accent md:ml-0 md:w-72"
          >
            <Search className="size-3.5" />
            <span className="hidden md:inline">{t('shell.search')}</span>
            <kbd className="ml-auto hidden rounded border border-fd-border px-1 font-mono text-[10px] md:inline">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <LocaleSwitcher />
            <ThemeToggle />
            <UserMenu user={user} logoutAction={logoutAction} />
          </div>
        </header>

        <main className="flex-1">
          {locked ? (
            <div className="grid h-[60vh] place-items-center px-6 text-center">
              <div className="space-y-2">
                <p className="font-medium">{t('shell.mustChangeTitle')}</p>
                <p className="text-sm text-fd-muted-foreground">
                  {t('shell.mustChangeHint')}
                </p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        items={commands}
      />
    </div>
  );
}

function ThemeToggle() {
  const t = useT();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const options = [
    { value: 'light', label: t('theme.light'), icon: Sun },
    { value: 'dark', label: t('theme.dark'), icon: Moon },
    { value: 'system', label: t('theme.system'), icon: Monitor },
  ] as const;
  const active = options.find((option) => option.value === theme) ?? options[2];
  const Icon = mounted ? active.icon : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={t('theme.label')}>
          <Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => setTheme(option.value)}
          >
            <option.icon />
            {option.label}
            {mounted && theme === option.value ? (
              <span className="ml-auto text-xs text-fd-muted-foreground">
                ✓
              </span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({
  user,
  logoutAction,
}: {
  user: ShellUser;
  logoutAction: () => Promise<void>;
}) {
  const t = useT();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-8 items-center gap-2 rounded-lg px-1.5 text-sm transition-colors hover:bg-fd-accent"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-fd-primary/12 text-[11px] font-semibold text-fd-primary">
            {user.email.slice(0, 2).toUpperCase()}
          </span>
          <ChevronsUpDown className="size-3.5 text-fd-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>
          <span className="block truncate font-medium text-fd-foreground">
            {user.email}
          </span>
          {t(user.role === 'admin' ? 'common.admin' : 'common.editor')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/account">
            <UserCog />
            {t('shell.myAccount')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => void logoutAction()}>
          <LogOut />
          {t('shell.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
