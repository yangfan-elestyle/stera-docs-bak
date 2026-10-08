import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { LayoutDashboard } from 'lucide-react';
import stera_logo_light from '@/assets/stera-logo-light.svg';
import stera_logo_dark from '@/assets/stera-logo-dark.svg';
import { i18n } from './i18n';
import { SITE } from './site';

// 落地页顶部导航的主入口 (type 'main')。回落地页走左上角 logo, 不另设「首页」;
// 文档页侧边栏已有 tab 下拉切 文档/API, 由 DocsLayout 过滤掉这些 main 链接。
const NAV_LINKS: Record<string, { docs: string; api: string }> = {
  ja: { docs: 'ドキュメント', api: 'API リファレンス' },
  en: { docs: 'Documentation', api: 'API reference' },
  zh: { docs: '文档', api: 'API 参考' },
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
    links: [
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
