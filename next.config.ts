import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Up to 6 photos of 4 MB each (Vercel itself caps requests at 4.5 MB)
    serverActions: { bodySizeLimit: "30mb" },
  },
};

export default nextConfig;
