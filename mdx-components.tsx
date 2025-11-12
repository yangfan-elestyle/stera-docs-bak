import { APIPage } from 'fumadocs-openapi/ui';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { openapi } from '@/lib/openapi';
import EText from '@/components/EText';
import EImg from '@/components/EImg';
import EContainer from '@/components/EContainer';
import EHome from '@/components/EHome';

export function getMDXComponents(options?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    APIPage: (props) => <APIPage {...openapi.getAPIPageProps(props)} />,
    // Custom MDX components
    EText,
    EImg,
    EContainer,
    EHome,
    ...options,
  };
}
