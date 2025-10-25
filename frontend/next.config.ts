import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // Proxy API requests to backend to avoid CORS issues
  async rewrites() {
    // Use 'backend' service name when running in Docker, localhost otherwise
    const backendUrl = process.env.BACKEND_URL || 'http://backend:8080';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${backendUrl}/health`,
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
