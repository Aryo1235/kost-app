import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Satu proses standalone untuk image Docker (TECH-SPEC 11.4).
  output: "standalone",
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
