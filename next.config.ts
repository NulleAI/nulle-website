import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Pin the project root so a lockfile elsewhere on the machine is never
  // mistaken for a workspace root.
  outputFileTracingRoot: __dirname,
  // App icons for Nulle's own apps, served by the App Store's image host.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "is1-ssl.mzstatic.com", port: "", pathname: "/image/thumb/**", search: "" },
    ],
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
