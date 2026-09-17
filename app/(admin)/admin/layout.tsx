import '@/app/global.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AdminI18nProvider } from '@/components/admin/i18n';
import { TooltipProvider } from '@/components/admin/ui/primitives';
import { getAdminI18n } from '@/lib/admin/i18n/server';

const inter = Inter({ subsets: ['latin'] });

// 后台不进搜索引擎
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminI18n();
  const brand = t('meta.brand');
  return {
    title: { default: brand, template: `%s · ${brand}` },
    robots: { index: false, follow: false },
  };
}

// 后台是与站点并列的另一个 root layout (app/(site) 一个, app/(admin) 一个):
// 站点那侧的语言由 URL 段决定并挂着 fumadocs 的 i18n provider; 后台的界面语言是独立的
// 一份偏好 (cookie `stera_admin_locale`), 共用会让 /admin/preview 跟着界面语言翻页。
export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dict } = await getAdminI18n();

  return (
    <html lang={locale} className={inter.className} suppressHydrationWarning>
      <body className="bg-fd-background text-fd-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AdminI18nProvider locale={locale} dict={dict}>
            <TooltipProvider>{children}</TooltipProvider>
          </AdminI18nProvider>
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
