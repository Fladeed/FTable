import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: [],
  },
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
  allowedDevOrigins: ['127.0.0.1.nip.io', '*.nip.io'],
  transpilePackages: ['flotable'],
};

export default nextConfig;
