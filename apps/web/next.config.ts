import path from 'node:path';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { loadEnvConfig } from '@next/env';
import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

const monorepoRoot = path.join(__dirname, '../..');
loadEnvConfig(monorepoRoot);

const webPackage = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf8')) as {
  version: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const proxyTarget = apiBase.startsWith('http') ? apiBase : 'http://localhost:3000';

const isWindows = process.platform === 'win32';

function resolveAppBuildId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_BUILD_ID?.trim();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === 'development') return 'dev';

  const buildIdFile = path.join(__dirname, '.build-id');
  if (existsSync(buildIdFile)) {
    const fromFile = readFileSync(buildIdFile, 'utf8').trim();
    if (fromFile) return fromFile;
  }

  try {
    return execSync('git rev-parse --short HEAD', {
      cwd: monorepoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'unknown';
  }
}

const appBuildId = resolveAppBuildId();

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  cacheOnNavigation: true,
  reloadOnOnline: false,
  additionalPrecacheEntries: [{ url: '/~offline', revision: appBuildId }],
});

const nextConfig: NextConfig = {
  output: isWindows ? undefined : 'standalone',
  outputFileTracingRoot: isWindows ? undefined : monorepoRoot,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
    NEXT_PUBLIC_GOOGLE_AUTH_URL: process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ?? '',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? '',
    NEXT_PUBLIC_APP_BUILD_ID: appBuildId,
    NEXT_PUBLIC_APP_VERSION: webPackage.version,
  },
  sassOptions: {
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

export default withSerwist(nextConfig);
