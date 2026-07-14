import path from 'node:path';
import { readFileSync } from 'node:fs';
import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';

const monorepoRoot = path.join(__dirname, '../..');
loadEnvConfig(monorepoRoot);

const webPackage = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf8')) as {
  version: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const proxyTarget = apiBase.startsWith('http') ? apiBase : 'http://localhost:3000';

const isWindows = process.platform === 'win32';
const appBuildId =
  process.env.NEXT_PUBLIC_APP_BUILD_ID?.trim() ||
  (process.env.NODE_ENV === 'development' ? 'dev' : webPackage.version);

const nextConfig: NextConfig = {
  output: isWindows ? undefined : 'standalone',
  outputFileTracingRoot: isWindows ? undefined : monorepoRoot,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
    NEXT_PUBLIC_GOOGLE_AUTH_URL: process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ?? '',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? '',
    NEXT_PUBLIC_APP_BUILD_ID: appBuildId,
  },  sassOptions: {
    includePaths: [path.join(__dirname, 'src/sass'), path.join(__dirname, 'src')],
    additionalData: "@use 'helpers/mixins' as mx;\n",
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      type: 'asset/resource',
    });
    return config;
  },
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${proxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
