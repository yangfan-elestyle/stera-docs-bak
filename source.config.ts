import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';
import type { LLMsOptions } from 'fumadocs-core/mdx-plugins/remark-llms';
import { z } from 'zod';

// Extend frontmatter schema to support custom TOC max depth and redirect

const customFrontmatterSchema = frontmatterSchema.extend({
  tocMaxDepth: z.number().int().positive().optional(),
  redirect: z.string().optional(),
});

const llmsOptions: LLMsOptions = {
  mdxAsPlaceholder: [
    'APIPage',
    'Callout',
    'EHome',
    'EMermaid',
    'ErrorCodeTable',
  ],
};

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  docs: {
    schema: customFrontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: llmsOptions,
    },
  },
  meta: {
    schema: metaSchema.extend({
      sectionNotes: z.record(z.string(), z.string()).optional(),
    }),
  },
});

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkImageOptions: {
      useImport: false,
    },
  },
});
