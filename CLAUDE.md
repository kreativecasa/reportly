# Reportly — Project Context for Claude

## What this is
A SaaS product that generates AI-written client reports in 60 seconds. Connects to Google Analytics 4, uses Claude AI to write the narrative, exports branded PDFs, and delivers via share link or email. Live at **https://www.reportlyapp.me**. Repo: `https://github.com/kreativecasa/reportly.git`

## Stack
- Next.js 16 App Router + TypeScript strict
- Tailwind v4 + MDI icons (`@mdi/react` + `@mdi/js`) — **NO emoji anywhere in UI**
- Prisma + Supabase Postgres (1 migration applied, DB is live)
- NextAuth v5 credentials provider only
- Inngest background jobs (report generation, PDF render, email sends)
- Puppeteer + `@sparticuz/chromium` for PDF on Vercel
- Anthropic SDK — model `claude-sonnet-4-5`
- Resend — transactional email, domain `reportlyapp.me` verified in GoDaddy DNS
- Supabase Storage — bucket `reports` for PDFs
- Upstash Redis — rate limiting (env vars not yet set in Vercel → currently inactive)
- **Gumroad** for payments — NOT Stripe (original plan said Stripe, we switched)
- Vercel Analytics enabled

## Coding conventions
- Server components by default; `"use client"` only when hooks/interactivity needed
- MDI icons: `import Icon from "@mdi/react"` + named paths from `@mdi/js`
- Tailwind CSS variable syntax: `bg-[hsl(var(--primary))/0.08]`
- All API routes: `requireSession()` + `requireWorkspaceAccess()` guards
- Zod on every API input; never trust body-supplied IDs
- Defensive array rendering: `Array.isArray(x) ? x : []` everywhere (Claude AI returns inconsistent JSON)
- Design preference: clean light theme, white backgrounds, card-based layouts

## What's complete ✅ (Phases 1 & 2)
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

## What's remaining ⏳

### Phase 3 — Payments (START HERE)
All scaffolding exists — just needs wiring:
- `src/app/api/webhooks/gumroad/route.tsx` — handle ping → flip `subscription.plan = PAID`
  - Webhook URL: `https://www.reportlyapp.me/api/webhooks/gumroad?secret=9066daeaabafbe6bb9e71771d30208d17e0d1a81263c6f48`
- `src/app/api/billing/checkout/route.ts` — redirect to Gumroad product page
- `src/lib/gumroad.ts` — Gumroad API wrapper (already scaffolded)
- `src/lib/plan-limits.ts` — `assertCanAddClient()` + `assertCanGenerateReport()` — call these in every create endpoint
- Handle cancellation / refund Gumroad pings
- Upgrade prompt UI on limit hit
- Trial-ending email (7 days before expiry via Inngest)
- Payment-failed email

### Phase 4 — Hardening
- Add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` to Vercel → activates rate limiting
- Add Sentry: `SENTRY_DSN` env vars + `npx @sentry/wizard@latest -i nextjs`
- Security headers in `next.config.js`
- Set `FROM_EMAIL=noreply@reportlyapp.me` in Vercel (domain verified, just not set yet)
- Run 14-step smoke test from plan file before enabling live payments

## Key files
```
src/app/api/webhooks/gumroad/route.tsx  ← Phase 3 start here
src/app/api/billing/checkout/route.ts   ← Gumroad redirect
src/lib/gumroad.ts                      ← Gumroad wrapper
src/lib/plan-limits.ts                  ← assertCan* guards
src/lib/claude.ts                       ← AI prompt builder
src/lib/ga4.ts                          ← GA4 Data API + token refresh
src/lib/crypto.ts                       ← AES-256 encrypt/decrypt
src/inngest/generate-report.ts          ← main Inngest job
src/inngest/generate-pdf.ts             ← Puppeteer PDF job
src/components/report/report-view.tsx   ← defensive chart renderer
src/emails/                             ← all 8 React Email templates
```

## Environment variables
All live in Vercel dashboard. For local dev copy from Vercel to `.env.local`:
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
FROM_EMAIL                        # noreply@reportlyapp.me (domain verified)
FROM_NAME                         # Reportly
SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
SUPABASE_STORAGE_BUCKET           # reports
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY
SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_APP_URL               # https://www.reportlyapp.me
PDF_RENDER_SECRET                 # openssl rand -hex 32
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
