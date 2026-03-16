/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  env: {
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
    SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL,
    NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
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