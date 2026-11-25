import type { NextConfig } from "next";

/**
 * Security headers on every response.
 *
 * - HSTS has no includeSubDomains or preload yet: other nulle.ai
 *   subdomains (mail.nulle.ai among them) have not been checked for
 *   HTTPS, and preload is hard to undo.
 * - The only CSP directive is frame-ancestors. A full script policy needs
 *   nonces or hashes for Next.js's inline scripts and the JSON-LD, which
 *   is its own change.
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Pin the project root so a lockfile elsewhere on the machine is never
  // mistaken for a workspace root.
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
