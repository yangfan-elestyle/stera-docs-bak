import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import { z } from 'zod';

// Extend frontmatter schema to support custom TOC max depth and redirect

const customFrontmatterSchema = frontmatterSchema.extend({
  tocMaxDepth: z.number().int().positive().optional(),
  redirect: z.string().optional(),
  // Tenant visibility: whitelist via `visibleOnTenant` (values are tenant keys like "smcc")
  visibleOnTenant: z.array(z.string()).optional(),
});

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  docs: {
    schema: customFrontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    // Allow folder-level tenant visibility control in meta.json
    schema: metaSchema.extend({
      visibleOnTenant: z.array(z.string()).optional(),
      sectionNotes: z.record(z.string(), z.string()).optional(),
    }),
  },
});

export default defineConfig({
  mdxOptions: {},
});
