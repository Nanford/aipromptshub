import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'x.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
  },
};

export default nextConfig;
