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
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Dev: direct URLs unless NEXT_IMAGE_OPTIMIZE=1 (avoids ENOSPC from image cache on Windows).
    unoptimized:
      process.env.NODE_ENV === "development" && process.env.NEXT_IMAGE_OPTIMIZE !== "1",
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
