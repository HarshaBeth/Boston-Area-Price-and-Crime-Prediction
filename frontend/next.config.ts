import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    experimental: {
    reactCompiler: false,
  },
  eslint: {
    // Allow builds to proceed even if ESLint finds issues
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
