import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Indikator Next dev di kanan bawah, supaya tidak menutupi menu pengguna di kiri bawah sidebar.
  devIndicators: { position: "bottom-right" },
  // Header keamanan dasar (TECH-SPEC 3.9). CSP menyusul di Caddy (M8).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
