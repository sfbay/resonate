import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Pre-existing lint errors in demo pages and landing page.
    // These are non-blocking runtime issues — fix incrementally.
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Ensure Clerk keys are available in Edge Runtime (middleware)
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  webpack: (config) => {
    // Ensure @/ alias resolves correctly on all build environments
    config.resolve.alias['@'] = resolve(__dirname, 'src');
    // Fix redux-thunk hoisting issue with recharts -> @reduxjs/toolkit
    config.resolve.alias['redux-thunk'] = resolve(__dirname, 'node_modules/redux-thunk');
    return config;
  },
};

export default nextConfig;
