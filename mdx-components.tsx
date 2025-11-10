import { APIPage } from 'fumadocs-openapi/ui';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { openapi } from '@/lib/openapi';
import EText from '@/components/EText';
import EImg from '@/components/EImg';
import EContainer from '@/components/EContainer';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    APIPage: (props) => <APIPage {...openapi.getAPIPageProps(props)} />,
    EText,
    EImg,
    EContainer,
    ...components,
  };
}
