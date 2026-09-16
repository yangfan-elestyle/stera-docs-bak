import '@/app/global.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/admin/ui/primitives';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: '文档管理', template: '%s · 文档管理' },
  // 后台不进搜索引擎
  robots: { index: false, follow: false },
};

// 后台是与站点并列的另一个 root layout (app/(site) 一个, app/(admin) 一个):
// 站点那侧的 <html lang> 由 URL 段决定并挂着 i18n provider, 后台不做多语言, 共用会把
// 语言开关一起带进后台。这一层只管文档骨架与全局 provider, 侧栏在 (shell) 里。
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={inter.className} suppressHydrationWarning>
      <body className="bg-fd-background text-fd-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast:
                  'rounded-lg border border-fd-border bg-fd-popover text-fd-popover-foreground shadow-lg',
                description: 'text-fd-muted-foreground',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
