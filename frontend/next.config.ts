import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  // Configure image domains
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'giorgiopriviteralab.com',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'giorgiopriviteralab.com',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Proxy API requests to backend to avoid CORS issues
  async rewrites() {
    // Use 'backend' service name when running in Docker, giorgiopriviteralab.com otherwise
    const backendUrl = process.env.BACKEND_URL || 'http://giorgiopriviteralab.com';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${backendUrl}/health`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
  
  // Remove strict-origin-when-cross-origin in development
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
