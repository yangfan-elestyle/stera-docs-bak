import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { openapi } from '@/lib/openapi';
import EText from '@/components/EText';
import EImg from '@/components/EImg';
import EContainer from '@/components/EContainer';
import EHome from '@/components/EHome';
import { ErrorCodeTable } from '@/components/ErrorCodeTable';
import { Mermaid } from '@/components/Mermaid';
import { APIPage } from './components/api-page';

export function getMDXComponents(options?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    APIPage,
    // Custom MDX components
    EText,
    EImg,
    EContainer,
    EHome,
    ErrorCodeTable,
    Mermaid,
    ...options,
  };
}
