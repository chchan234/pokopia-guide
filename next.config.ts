import type { NextConfig } from 'next';

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? '';
const normalizedBasePath =
  rawBasePath.length > 0
    ? `/${rawBasePath.replace(/^\/+|\/+$/g, '')}`
    : '';

const nextConfig: NextConfig = normalizedBasePath
  ? {
      basePath: normalizedBasePath,
    }
  : {};

export default nextConfig;
