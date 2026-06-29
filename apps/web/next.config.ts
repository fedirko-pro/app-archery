import path from 'node:path';
import type { NextConfig } from 'next';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const proxyTarget = apiBase.startsWith('http') ? apiBase : 'http://localhost:3000';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
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

export default nextConfig;
