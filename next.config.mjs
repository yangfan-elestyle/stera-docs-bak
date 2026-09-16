import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// public/docs/** = hash 命名的图片与版本化 SDK 包, 内容不变。
const PUBLIC_ASSET_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'zip'];

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  env: { DOCS_ENV: process.env.DOCS_ENV ?? '' },
  images: {
    // Disable Next.js image optimizer to avoid `_next/image` route issues
    unoptimized: true,
  },
  allowedDevOrigins: ['*.localhost', '*.*.localhost', '*.*.*.localhost'],
  async headers() {
    // Node 运行时对 public/ 下的文件默认发 max-age=0, 长缓存须在此显式声明。
    return PUBLIC_ASSET_EXTENSIONS.map((ext) => ({
      source: `/docs/:path*.${ext}`,
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=2592000, immutable',
        },
      ],
    }));
  },
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
