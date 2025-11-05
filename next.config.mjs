import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    // Allow external images used in MDX content
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cloudimg.io',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
    ],
  },
};

export default withMDX(config);
