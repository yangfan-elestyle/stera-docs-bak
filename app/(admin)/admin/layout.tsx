import '@/app/global.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { currentUser } from '@/lib/auth/guard';
import { logout } from './actions';

export const metadata: Metadata = {
  title: 'stera smart one Docs 管理',
  // 后台不进搜索引擎
  robots: { index: false, follow: false },
};

// 后台是独立的 root layout (与 app/(site) 并列): 站点那侧的 <html lang> 由 URL 段决定,
// 后台不做多语言, 共用会让语言开关与 i18n provider 跟着进后台。
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen bg-fd-background text-fd-foreground">
        <header className="border-b border-fd-border">
          <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4 text-sm">
            <span className="font-semibold">Docs 管理</span>
            {user ? (
              <>
                <Link href="/admin/content" className="hover:underline">
                  内容
                </Link>
                <Link href="/admin/nav" className="hover:underline">
                  导航
                </Link>
                {user.role === 'admin' ? (
                  <Link href="/admin/users" className="hover:underline">
                    账号
                  </Link>
                ) : null}
                <span className="ml-auto text-fd-muted-foreground">
                  {user.email} ({user.role})
                </span>
                <form action={logout}>
                  <button type="submit" className="hover:underline">
                    退出
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
