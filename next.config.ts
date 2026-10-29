import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  webpack: (config, { dev }) => {
    // Avoid corrupted pack cache when .next is removed while dev is running (common on Windows).
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
