import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { getApiBaseUrl } from "./lib/api/config";

const isDev = process.env.NODE_ENV === "development";
const apiUrl = new URL(getApiBaseUrl());
const apiOrigin = apiUrl.origin;
// Upgrading would break a plain-http API (e.g. local `next start` against localhost:8000).
const upgradeInsecureRequests = !isDev && apiUrl.protocol === "https:";

// Static (nonce-less) CSP so storefront pages stay statically rendered;
// Next.js inline bootstrap scripts therefore require 'unsafe-inline'.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://*.googletagmanager.com${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Admins may paste any https image URL, not just Cloudinary.
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin} https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com${isDev ? " ws:" : ""}`,
  "frame-src https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(upgradeInsecureRequests ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Catalog images are served from Cloudinary by the Storefront API.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
