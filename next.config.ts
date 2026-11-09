import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentUpgrade: "security",
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    const isProduction =
      process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
    const defaultBackend = isProduction
      ? "https://flowpilot-backend-01yp.onrender.com/api/v1"
      : "http://localhost:4000/api/v1";

    const rawBackendUrl =
      process.env.BACKEND_API_URL ||
      (process.env.NEXT_PUBLIC_API_BASE_URL?.startsWith("http")
        ? process.env.NEXT_PUBLIC_API_BASE_URL
        : undefined) ||
      defaultBackend;
    const backendOrigin = rawBackendUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
