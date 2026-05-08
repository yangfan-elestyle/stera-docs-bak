import { createMDX } from 'fumadocs-mdx/next';

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
};

export default withMDX(config);
