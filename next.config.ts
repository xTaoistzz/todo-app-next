import type { NextConfig } from "next";

/**
 * BASE PATH
 * - app1 => /app1
 * - app2 => /app2
 * - app3 => /app3
 * - default => '' (root)
 */
// const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/app1";

const nextConfig: NextConfig = {
  // Enable standalone output - เหมาะกับ Docker / Infra
  output: "standalone",

  // ✅ Base Path (หัวใจของ subpath routing)
  // basePath: BASE_PATH,

  // Optimize images
  images: {
    minimumCacheTTL: 60,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable compression
  compress: true,

  // Source maps (client)
  productionBrowserSourceMaps: false,

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ["mongodb", "mysql2", "pg"],
  },

  // Console handling
  compiler: {
    removeConsole: false,
  },

  // Turbopack (default)
  turbopack: {},

  // Security hygiene
  poweredByHeader: false,

  // ✅ HTTP caching headers (รองรับ basePath)
  async headers() {
    return [
      {
        source: `/:all*(svg|jpg|png|webp|avif|gif)`,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: `/_next/static/:path*`,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
