import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 dev uses Turbopack by default; acknowledge it while keeping webpack for build.
  // LAN URL printed by `next dev` (172.22.192.1). Without this, dev JS is blocked and the signup buttons do nothing.
  allowedDevOrigins: ["172.22.192.1"],
  // Phone/LAN browsers call the site host. Proxy /api to the FastAPI process on this machine.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:4000/api/:path*",
      },
    ];
  },
  turbopack: {},
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
