import type { NextConfig } from 'next';

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? '';
const normalizedBasePath =
  rawBasePath.length > 0
    ? `/${rawBasePath.replace(/^\/+|\/+$/g, '')}`
    : '';

const sharedConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

const nextConfig: NextConfig = normalizedBasePath
  ? {
      ...sharedConfig,
      basePath: normalizedBasePath,
    }
  : sharedConfig;

export default nextConfig;
