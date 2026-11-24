import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Room for up to 6 photos of 8 MB each, plus multipart overhead
    serverActions: { bodySizeLimit: "50mb" },
  },
};

export default nextConfig;
