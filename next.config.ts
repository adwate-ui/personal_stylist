import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization for Cloudflare (since default Next.js Image Optimization is not supported on Pages without paid worker)
  images: {
    unoptimized: true,
  },

  // Environment variable validation can be added here if needed
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Webpack configuration to handle Supabase imports correctly
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Fix for Supabase wrapper.mjs import issue with webpack
      '@supabase/supabase-js': '@supabase/supabase-js/dist/module/index.js',
    };
    return config;
  },
};

export default nextConfig;
