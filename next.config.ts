import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''};
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: https:;
              connect-src 'self' ${process.env.NODE_ENV === 'development' ? 'ws: wss:' : ''} https:;
              frame-ancestors 'none';
              form-action 'self';
              upgrade-insecure-requests;
              block-all-mixed-content;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
  
  // Optimize for production
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  
  // Security: Disable server sourcemaps in production
  productionBrowserSourceMaps: false,
  
  // Security: Disable X-Powered-By header
  poweredByHeader: false,
  
  // Compress assets
  compress: true,
  
  // Image optimization security
  images: {
    domains: [], // Explicitly define allowed domains
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Environment variables that are safe to expose
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Redirects for security
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/api',
        destination: '/404',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
