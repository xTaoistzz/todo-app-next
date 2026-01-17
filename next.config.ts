import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    minimumCacheTTL: 60,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  compress: true,
  productionBrowserSourceMaps: false,

  /**
   * ❗ ห้าม optimize DB packages
   * เพราะมี side-effect และ native bindings
   */
  experimental: {
    optimizePackageImports: [],
  },

  compiler: {
    removeConsole: false,
  },

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
