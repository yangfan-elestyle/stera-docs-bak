import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { LayoutDashboard } from 'lucide-react';
import stera_logo_light from '@/assets/stera-logo-light.svg';
import stera_logo_dark from '@/assets/stera-logo-dark.svg';
import { i18n } from './i18n';
import { SITE } from './site';

export function baseOptions(_locale: string): BaseLayoutProps {
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
