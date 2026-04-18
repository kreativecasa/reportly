import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Content Security Policy
// - 'unsafe-inline' on style-src is needed for Tailwind/Next runtime styles
// - Recharts + Next.js dev tooling require 'unsafe-inline' and 'unsafe-eval' on script-src in dev;
//   production restricts to self + Vercel insights
const isProd = process.env.NODE_ENV === "production";
const CSP = [
  "default-src 'self'",
  // 'unsafe-inline' is needed for Next.js runtime scripts; 'unsafe-eval' only in dev for HMR
  `script-src 'self' 'unsafe-inline' ${isProd ? "" : "'unsafe-eval'"} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://analyticsdata.googleapis.com https://oauth2.googleapis.com https://api.gumroad.com https://*.ingest.sentry.io https://*.upstash.io https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://gumroad.com",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

// Only wrap in Sentry when configured — keeps dev builds fast when no DSN is set.
const shouldUseSentry = Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);

export default shouldUseSentry
  ? withSentryConfig(nextConfig, {
      silent: true,
      widenClientFileUpload: true,
      sourcemaps: { disable: false },
      disableLogger: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : nextConfig;
