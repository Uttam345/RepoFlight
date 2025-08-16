/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repoflight/shared', '@repoflight/database'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  webpack: (config, { dev, isServer }) => {
    // Fix webpack caching issues in development
    if (dev) {
      config.cache = false;
      config.snapshot = {
        managedPaths: [],
        immutablePaths: [],
        buildDependencies: {
          hash: true,
          timestamp: true,
        },
        module: {
          timestamp: true,
        },
        resolve: {
          timestamp: true,
        },
        resolveBuildDependencies: {
          hash: true,
          timestamp: true,
        },
      };
    }

    // Handle node modules that might cause issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
}

module.exports = nextConfig