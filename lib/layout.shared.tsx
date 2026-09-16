import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { LayoutDashboard } from 'lucide-react';
import stera_logo_light from '@/assets/stera-logo-light.svg';
import stera_logo_dark from '@/assets/stera-logo-dark.svg';
import { i18n } from './i18n';
import { SITE } from './site';

// 顶部导航的几条主入口。落地页 (HomeLayout) 与文档页 (DocsLayout) 共用同一份,
// 从落地页点进文档、再从文档点回落地页都走这里。
const NAV_LINKS: Record<string, { docs: string; api: string; home: string }> = {
  ja: { docs: 'ドキュメント', api: 'API リファレンス', home: 'ホーム' },
  en: { docs: 'Documentation', api: 'API reference', home: 'Home' },
  zh: { docs: '文档', api: 'API 参考', home: '首页' },
};

export function baseOptions(locale: string): BaseLayoutProps {
  const labels = NAV_LINKS[locale] ?? NAV_LINKS.ja;

  return {
    i18n,
    nav: {
      title: (
        <>
          <Image
            src={stera_logo_light}
            width={90}
            alt="Logo"
            className="block dark:hidden"
          />
          <Image
            src={stera_logo_dark}
            width={90}
            alt="Logo"
            className="hidden dark:block"
          />
        </>
      ),
    },
    githubUrl: 'https://github.com/elestyle',
    links: [
      { type: 'main', text: labels.home, url: '/' },
      { type: 'main', text: labels.docs, url: '/overview' },
      { type: 'main', text: labels.api, url: '/openapi' },
      {
        type: 'icon',
        icon: <LayoutDashboard />,
        text: 'Dashboard',
        url: SITE.dashboardUrl,
        external: true,
      },
    ],
  };
}
