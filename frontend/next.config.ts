import type { NextConfig } from "next";

// Work item attachments are served from the backend's own origin (see
// lib/image-url.ts), not this app's — next/image needs that origin allow-listed
// to optimize them. Derived from the same env var the client already uses to
// reach the API, so dev/staging/prod all pick up the right host automatically.
const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api');

const nextConfig: NextConfig = {
  // Emits a self-contained .next/standalone server so the production Docker
  // image doesn't need to carry the full node_modules tree.
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: apiOrigin.protocol.replace(':', '') as 'http' | 'https',
        hostname: apiOrigin.hostname,
        port: apiOrigin.port,
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
