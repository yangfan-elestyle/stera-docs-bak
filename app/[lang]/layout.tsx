import '@/app/global.css';
import { i18n } from '@/lib/i18n';
import { defineI18nUI } from 'fumadocs-ui/i18n';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
});

const { provider } = defineI18nUI(i18n, {
  translations: {
    ja: {
      displayName: '日本語',
      search: 'ドキュメントを検索',
      chooseLanguage: '言語を選択',
    },
    zh: {
      displayName: '简体中文',
      search: '搜索文档',
      chooseLanguage: '选择语言',
    },
    en: {
      displayName: 'English',
    },
  },
});

export default async function Layout({
  params,
  children,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider i18n={provider(lang)}>{children}</RootProvider>
      </body>
    </html>
  );
}
