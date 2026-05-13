import '@/app/global.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { detectTenantByHost, getRequestHost } from '@/lib/tenant';
import { i18n } from '@/lib/i18n';
import { defineI18nUI } from 'fumadocs-ui/i18n';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter } from 'next/font/google';
import ChatbotLauncher from '@/components/ChatbotLauncher';

const inter = Inter({
  subsets: ['latin'],
});

const { provider } = defineI18nUI(i18n, {
  translations: {
    ja: {
      displayName: '日本語',
      search: '検索',
      searchNoResult: '結果が見つかりません',
      toc: 'このページ',
      tocNoHeadings: '見出しがありません',
      lastUpdate: '最終更新日',
      chooseLanguage: '言語を選択',
      nextPage: '次のページ',
      previousPage: '前のページ',
      chooseTheme: 'テーマ',
      editOnGithub: 'GitHub で編集',
    },
    zh: {
      displayName: '简体中文',
      search: '搜索',
      searchNoResult: '未找到结果',
      toc: '本页目录',
      tocNoHeadings: '无标题',
      lastUpdate: '最后更新于',
      chooseLanguage: '选择语言',
      nextPage: '下一页',
      previousPage: '上一页',
      chooseTheme: '主题',
      editOnGithub: '在 GitHub 上编辑',
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
        <ChatbotLauncher />
      </body>
    </html>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const tenant = detectTenantByHost(getRequestHost(h));
  const icon = tenant === 'smcc' ? '/favicon-smcc.ico' : '/favicon.ico';
  return {
    icons: {
      icon,
      shortcut: icon,
    },
  };
}
