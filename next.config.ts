import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['172.20.10.5, 192.168.55.106'],
};

export default nextConfig;
