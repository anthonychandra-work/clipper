import type { NextConfig } from 'next';

const DEFAULT_SERVICE_PORT = '8765';
const DEFAULT_BUILD_DIR = '.next';

const servicePort = process.env.CLIPPER_SERVICE_PORT ?? DEFAULT_SERVICE_PORT;

const nextConfig: NextConfig = {
  distDir: process.env.CLIPPER_WEB_BUILD_DIR ?? DEFAULT_BUILD_DIR,
  images: { unoptimized: true },
  rewrites: async () => [
    { source: '/api/:path*', destination: `http://127.0.0.1:${servicePort}/api/:path*` },
  ],
};

export default nextConfig;
