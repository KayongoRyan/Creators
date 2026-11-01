import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    // Dev: load Unsplash directly — avoids /_next/image cache writes (ENOSPC on Windows).
    unoptimized: process.env.NODE_ENV === "development",
  },
  webpack: (config, { dev }) => {
    // Avoid corrupted pack cache when .next is removed while dev is running (common on Windows).
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
