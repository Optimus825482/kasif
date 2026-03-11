import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
      },
    ],
  },
  async rewrites() {
    return [
      // Yüklenen görselleri API üzerinden sun (Coolify/proxy 404 sorununu giderir)
      { source: "/uploads/:path*", destination: "/api/uploads/:path*" },
    ];
  },
};

export default nextConfig;
