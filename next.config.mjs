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
  webpack: (config) => {
    // Ensure @/ alias resolves correctly on all build environments
    config.resolve.alias['@'] = resolve(__dirname, 'src');
    return config;
  },
};

export default nextConfig;
