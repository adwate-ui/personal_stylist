import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for OpenNext Cloudflare deployment
  // This creates a standalone build with all dependencies bundled
  // Required for Cloudflare Pages deployment with "Framework preset: None"
  // Using 'export' to generate static HTML/CSS/JS only (no cache files)
  output: 'export',
  // output: 'standalone',

  // Image optimization for Cloudflare (since default Next.js Image Optimization is not supported on Pages without paid worker)
  images: {
    unoptimized: true,
  },

  // Environment variable validation can be added here if needed
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },


};

export default nextConfig;
