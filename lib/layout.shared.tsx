import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import { i18n } from './i18n';

export function baseOptions(_locale: string): BaseLayoutProps {
  return {
    i18n,
    nav: {
      title: (
        <>
          <Image src={logo} width={24} height={24} alt="Logo" />
          Elepay Docs
        </>
      ),
    },
    links: [],
  };
}
