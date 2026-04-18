# Reportly — Project Context for Claude

## What this is
A SaaS product that generates AI-written client reports in 60 seconds. Connects to Google Analytics 4, uses Claude AI to write the narrative, exports branded PDFs, and delivers via share link or email. Live at **https://www.reportlyapp.me**. Repo: `https://github.com/kreativecasa/reportly.git`

## Stack
- Next.js 16 App Router + TypeScript strict
- Tailwind v4 + MDI icons (`@mdi/react` + `@mdi/js`) — **NO emoji anywhere in UI**
- Prisma + Supabase Postgres (3 migrations applied, DB is live)
- NextAuth v5 credentials provider only
- Inngest background jobs (report generation, PDF render, email sends, daily trial-ending cron)
- Puppeteer + `@sparticuz/chromium` for PDF on Vercel
- Anthropic SDK — model `claude-sonnet-4-5`
- Resend — transactional email, domain `reportlyapp.me` verified in GoDaddy DNS, `FROM_EMAIL` live
- Supabase Storage — bucket `reports` for PDFs
- Upstash Redis — rate limiting active (env vars set in Vercel)
- **Gumroad** for payments — NOT Stripe (original plan said Stripe, we switched)
- Sentry live (EU region `de.sentry.io`, org `reportly-wo`, project `javascript-nextjs`)
- Integrations live: Google Analytics 4 + Google Search Console. Google Ads + Meta Ads show "Request early access" (intent captured in `IntegrationRequest` table)
- Vercel Analytics enabled

## Coding conventions
- Server components by default; `"use client"` only when hooks/interactivity needed
- MDI icons: `import Icon from "@mdi/react"` + named paths from `@mdi/js`
- Tailwind CSS variable syntax: `bg-[hsl(var(--primary))/0.08]`
- All API routes: `requireSession()` + `requireWorkspaceAccess()` guards
- Zod on every API input; never trust body-supplied IDs
- Defensive array rendering: `Array.isArray(x) ? x : []` everywhere (Claude AI returns inconsistent JSON)
- Rate-limit every public or expensive route via `ratelimit("<key>").limit(...)` wrapped in try/catch — Redis downtime must never 500 the route
- Plan limits: throw `PlanLimitError` in create endpoints; `handleError` maps it to 402 `PLAN_LIMIT` which the `UpgradePrompt` component renders on the client
- CSP is strict: if you add a new external service called from the browser, extend `connect-src` (or `script-src`) in `next.config.ts`
- Design preference: clean light theme, white backgrounds, card-based layouts

## What's complete ✅ (Phases 1, 2, 3, 4)

### Core product (Phases 1 & 2)
- Auth: signup, login, email verification, password reset
- Workspace + clients CRUD
- GA4 OAuth (consent → callback → property selector → AES-256 encrypted token storage)
- Report generation: GA4 fetch → Claude AI → parse sections → Recharts charts
- Crash-safe `report-view.tsx` — handles null/malformed AI output
- PDF: Puppeteer → Supabase Storage → `pdfUrl` saved on report
- Public share link `/r/[token]`
- Send-to-client email with PDF
- All 8 React Email templates built
- Dashboard, sidebar nav, quick actions, stat cards with progress bars
- Full landing page with SEO (OpenGraph, JSON-LD, sitemap.ts, robots.ts)
- Split-panel auth pages with marketing copy

### Payments (Phase 3 — PR #1, merged)
- Gumroad webhook handles sale / cancellation / refund / dispute / subscription_* with API-based sale verification + idempotency via `GumroadEvent`
  - Webhook URL: `https://www.reportlyapp.me/api/webhooks/gumroad?secret=9066daeaabafbe6bb9e71771d30208d17e0d1a81263c6f48`
- `/api/billing/checkout` + `/api/billing/manage` wired; `billing-actions.tsx` renders Subscribe → Gumroad or Manage → Gumroad subscriber portal
- `assertCanAddClient` / `assertCanGenerateReport` / `assertCanConnectIntegration` enforced at every create endpoint
- `UpgradePrompt` component renders on 402 responses in the new-client and new-report forms
- Trial-ending email: daily Inngest cron (`trial-ending-cron`, 14:00 UTC) emails users ~7 days before trial end, tracked via `Subscription.trialEndingNotifiedAt` to prevent duplicates
- Payment-failed email wired on refund/dispute

### Hardening (Phase 4 — PR #2, merged)
- Security headers live on prod: CSP (broad `*.sentry.io` for EU region), HSTS (2y preload), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Rate limits active on Upstash: `generateReport` 5/h/user, `forgotPassword` 3/h/IP, `signup` 5/h/IP, `resetPassword` 5/h/IP, `ga4Finalize` 10/h/user (reused for `gsc-finalize`), `gumroadWebhook` 120/min/IP. All call sites degrade gracefully if Redis is unreachable.
- Sentry live on prod: root `instrumentation.ts` (server, `captureRequestError`), root `instrumentation-client.ts` (replay + `captureRouterTransitionStart`), `src/app/global-error.tsx` boundary, EU-region DSN. Sourcemap upload via `withSentryConfig` + `SENTRY_AUTH_TOKEN`.

### Google Search Console integration (PR #4, merged)
- Full OAuth flow: `/api/data-sources/connect/gsc` → `/api/data-sources/callback/gsc` → site picker at `/integrations/select-site` → `/api/data-sources/connect/gsc/finalize`
- `src/lib/gsc.ts` mirrors `ga4.ts`: consent URL, code exchange, site listing, token-refresh accessor, `fetchGSCData()` pulls totals + period-over-period comparison + top queries / pages / countries / devices / daily trend in one Promise.all
- Claude prompt conditionally emits an `seo` section with clicks+impressions line chart + top queries (with CTR + avg position)
- Inngest `generate-report` fetches both GA4 and GSC when both are linked

### Early-access request flow (PR #4)
- Google Ads + Meta Ads cards render "Request early access" instead of a dead "Coming soon" badge
- Click → `POST /api/integrations/request-access` → upserts into new `IntegrationRequest` table (`workspaceId + type` unique)
- Button flips to "Requested — we'll email you"

## What's remaining ⏳

- **Live Gumroad smoke test:** run one real card through the Gumroad product page, verify `subscription.plan=PAID` + invoice row + Manage subscription button. Test cancel → `subscription_ended` ping flips back to FREE. *(Gumroad access token was regenerated 2026-04-18; verifySale path confirmed working.)*
- **Trial-ending cron verification:** seed a TRIALING sub with `trialEnd ~7 days out`, manually invoke the cron in the Inngest dashboard, confirm email lands and `trialEndingNotifiedAt` is set.
- **When ready to ship Google Ads / Meta Ads:** query `SELECT type, COUNT(*) FROM "IntegrationRequest" GROUP BY type` for demand, then follow the GA4/GSC pattern to build them.
- **Optional:** address pre-existing `basic-ftp` CVE surfacing via puppeteer chain (`npm audit`).

## Key files
```
src/app/api/webhooks/gumroad/route.tsx                  ← Gumroad webhook handler
src/app/api/billing/checkout/route.ts                   ← Gumroad checkout redirect
src/app/api/billing/manage/route.ts                     ← Subscriber self-management URL
src/app/api/data-sources/connect/ga4/route.ts           ← GA4 OAuth consent
src/app/api/data-sources/callback/ga4/route.ts          ← GA4 OAuth callback + saveGA4DataSource
src/app/api/data-sources/connect/ga4/finalize/route.ts  ← GA4 property finalize
src/app/api/data-sources/connect/gsc/route.ts           ← GSC OAuth consent
src/app/api/data-sources/callback/gsc/route.ts          ← GSC OAuth callback + saveGSCDataSource
src/app/api/data-sources/connect/gsc/finalize/route.ts  ← GSC site finalize
src/app/api/integrations/request-access/route.ts        ← Early-access request handler
src/lib/gumroad.ts                                      ← Gumroad API wrapper
src/lib/plan-limits.ts                                  ← assertCan* guards + PlanLimitError
src/lib/claude.ts                                       ← AI prompt builder (GA4 + GSC aware)
src/lib/ga4.ts                                          ← GA4 Data API + token refresh
src/lib/gsc.ts                                          ← Search Console API + token refresh
src/lib/crypto.ts                                       ← AES-256 encrypt/decrypt
src/lib/redis.ts                                        ← Upstash ratelimit factory
src/inngest/generate-report.ts                          ← main Inngest job (GA4 + GSC)
src/inngest/generate-pdf.ts                             ← Puppeteer PDF job
src/inngest/trial-ending.tsx                            ← daily trial-ending email cron
src/components/report/report-view.tsx                   ← defensive chart renderer
src/components/upgrade-prompt.tsx                       ← 402 → upgrade CTA
src/app/(app)/integrations/integrations-client.tsx      ← integrations tab UI
src/app/(app)/integrations/select-property/             ← GA4 property picker
src/app/(app)/integrations/select-site/                 ← GSC site picker
src/emails/                                             ← all 8 React Email templates
instrumentation.ts                                      ← Sentry server/edge init
instrumentation-client.ts                               ← Sentry browser init
src/app/global-error.tsx                                ← App Router top-level error boundary
next.config.ts                                          ← security headers + Sentry wrapper
```

## Environment variables
Set in Vercel dashboard. For local dev copy from Vercel to `.env.local` via `vercel env pull`.

Already set in production:
```
DATABASE_URL, DIRECT_URL          # Supabase pooler URLs
NEXTAUTH_SECRET, AUTH_SECRET      # same value, openssl rand -base64 32
ENCRYPTION_KEY                    # openssl rand -hex 32
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
ANTHROPIC_API_KEY
ANTHROPIC_MODEL                   # claude-sonnet-4-5
GUMROAD_ACCESS_TOKEN, GUMROAD_PRODUCT_URL
GUMROAD_WEBHOOK_SECRET            # 9066daeaabafbe6bb9e71771d30208d17e0d1a81263c6f48
RESEND_API_KEY
FROM_EMAIL                        # noreply@reportlyapp.me
FROM_NAME                         # Reportly
SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
SUPABASE_STORAGE_BUCKET           # reports
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY
NEXT_PUBLIC_APP_URL               # https://www.reportlyapp.me
PDF_RENDER_SECRET                 # openssl rand -hex 32
```

Sentry env (also set in production):
```
SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN     # EU region DSN
SENTRY_ORG                             # reportly-wo
SENTRY_PROJECT                         # javascript-nextjs
SENTRY_AUTH_TOKEN                      # org-auth-token for sourcemap upload
```

## Local dev on a new machine
```bash
git clone https://github.com/kreativecasa/reportly.git
cd reportly
npm install
# Pull all env vars from Vercel:
npx vercel link && npx vercel env pull .env.local
npm run dev                   # → http://localhost:3000
npx inngest-cli@latest dev    # second terminal — background jobs
```
