import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "yumi-opic.vercel.app",
          },
        ],
        destination: "https://yumi-opic-pi.vercel.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
