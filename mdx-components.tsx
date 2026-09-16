import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { Root } from 'fumadocs-core/page-tree';
import { openapi } from '@/lib/openapi';
import EHome from '@/components/EHome';
import { ErrorCodeTable } from '@/components/ErrorCodeTable';
import { EMermaid } from '@/components/EMermaid';
import { APIPage } from './components/api-page';

// pageTree 在这里绑进 EHome: 组件自身 MUST NOT `import { source }`,
// 那是在渲染期反过来引用正在渲染它的 loader。
export function getMDXComponents(
  pageTree: Root,
  options?: MDXComponents,
): MDXComponents {
  return {
    ...defaultMdxComponents,
    APIPage,
    // Custom MDX components
    EHome: (props: { root: string }) => (
      <EHome {...props} pageTree={pageTree} />
    ),
    ErrorCodeTable,
    EMermaid,
    ...options,
  };
}
