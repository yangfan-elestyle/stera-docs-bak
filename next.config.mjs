import { createMDX } from 'fumadocs-mdx/next';
import { legacyRedirects } from './lib/legacy-redirects.mjs';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    // Disable Next.js image optimizer to avoid `_next/image` route issues
    unoptimized: true,
  },
  allowedDevOrigins: ['*.localhost', '*.*.localhost', '*.*.*.localhost'],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:lang(ja|en|zh)/:path*.md',
          destination: '/:lang/llms.mdx/:path*',
        },
      ],
    };
  },
  async redirects() {
    return legacyRedirects.map((r) => ({
      source: r.source,
      destination: r.destination,
      permanent: true,
    }));
  },
};

export default withMDX(config);

import('@opennextjs/cloudflare')
  .then(({ initOpenNextCloudflareForDev }) => initOpenNextCloudflareForDev())
  .catch((e) => console.warn('opennext init failed', e));
