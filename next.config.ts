import type { NextConfig } from "next";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/app3";

const nextConfig: NextConfig = {
  output: "standalone",

  // ✅ เปิด basePath
  basePath: BASE_PATH,

  images: {
    minimumCacheTTL: 60,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  compress: true,
  productionBrowserSourceMaps: false,

  experimental: {
    optimizePackageImports: ["mongodb", "mysql2", "pg"],
  },

  compiler: {
    removeConsole: false,
  },

  turbopack: {},
  poweredByHeader: false,

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
        // ⚠️ basePath จะถูก prepend ให้อัตโนมัติ
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
