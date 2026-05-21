import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { LayoutDashboard } from 'lucide-react';
import logo from '@/assets/logo.png';
import elepay_logo from '@/assets/elepay-logo.svg';
import stera_logo_light from '@/assets/stera-logo-light.svg';
import stera_logo_dark from '@/assets/stera-logo-dark.svg';
import { i18n } from './i18n';
import { getTextValue } from './tenant-config';
import EText from '@/components/EText';
import EContainer from '@/components/EContainer';

export function baseOptions(
  _locale: string,
  host?: string | null,
): BaseLayoutProps {
  return {
    i18n,
    nav: {
      title: (
        <>
          <EContainer tenant="smcc">
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
          </EContainer>
          <EContainer tenant="default">
            <Image src={elepay_logo} width={26} height={24} alt="Logo" />
          </EContainer>
          <EContainer tenant="default">
            <EText name="elepay_docs" />
          </EContainer>
        </>
      ),
    },
    githubUrl: 'https://github.com/elestyle',
    links: [
      {
        type: 'icon',
        icon: <LayoutDashboard />,
        text: 'Dashboard',
        url: getTextValue('dashboard_url', host) ?? '',
        external: true,
      },
    ],
  };
}
