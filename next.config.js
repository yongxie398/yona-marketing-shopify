/** @type {import('next').NextConfig} */

// Environment detection
// Priority: VERCEL_ENV > NODE_ENV > default to development
const ENV = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
const IS_PRODUCTION = ENV === 'production';
const IS_DEVELOPMENT = ENV === 'development';

// Log environment info (only during build)
if (process.env.NODE_ENV === 'production') {
  console.log(`[Next.js Config] Environment: ${ENV}`);
  console.log(`[Next.js Config] Is Production: ${IS_PRODUCTION}`);
  console.log(`[Next.js Config] Backend URL: ${process.env.BACKEND_URL || 'NOT SET'}`);
}

const nextConfig = {
  images: {
    unoptimized: true,
  },
  env: {
    // Explicitly pass these to the client
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
    SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL,
    NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
    NEXT_PUBLIC_BACKEND_URL: process.env.BACKEND_URL,
    NEXT_PUBLIC_ENVIRONMENT: ENV,
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://admin.shopify.com https://*.myshopify.com;",
          },
        ],
      },
    ];
  },
  // Vercel specific: Increase function timeout for API routes
  async rewrites() {
    return [];
  },
  // Disable eslint during build (optional - remove if you want strict checking)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable typescript errors during build (optional - remove if you want strict checking)
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Handle native modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        'timers/promises': false,
      };
    }
    
    // Mark redis and native modules as external to prevent webpack bundling issues
    if (isServer) {
      config.externals.push('redis');
      config.externals.push('@node-rs/xxhash');
    }
    
    return config;
  },
};

module.exports = nextConfig;
