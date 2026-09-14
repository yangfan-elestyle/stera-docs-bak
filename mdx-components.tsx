import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { openapi } from '@/lib/openapi';
import EHome from '@/components/EHome';
import { ErrorCodeTable } from '@/components/ErrorCodeTable';
import { EMermaid } from '@/components/EMermaid';
import { APIPage } from './components/api-page';

export function getMDXComponents(options?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    APIPage,
    // Custom MDX components
    EHome,
    ErrorCodeTable,
    EMermaid,
    ...options,
  };
}
