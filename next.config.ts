import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    // Avoid corrupted pack cache when .next is removed while dev is running (common on Windows).
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
