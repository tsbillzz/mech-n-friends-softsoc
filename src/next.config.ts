
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
    ],
  },
  // This is required for Next.js to work in this environment
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      allowedDevOrigins: ['https://*.cluster-fkltigo73ncaixtmokrzxhwsfc.cloudworkstations.dev'],
    },
  }),
};

export default nextConfig;
