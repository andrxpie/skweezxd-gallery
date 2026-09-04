import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Public Development URL бакета Cloudflare R2
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      // Власний домен, якщо колись підключимо його до бакета замість r2.dev
      ...(process.env.R2_PUBLIC_BASE_URL?.startsWith("https://")
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.R2_PUBLIC_BASE_URL).hostname,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
