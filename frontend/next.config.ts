import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a self-contained .next/standalone server so the production Docker
  // image doesn't need to carry the full node_modules tree.
  output: 'standalone',
};

export default nextConfig;
