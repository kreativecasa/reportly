# Reportly — Deployment & Launch Guide

## Accounts needed (create in order)

| Account | Why | Free tier | Notes |
|---|---|---|---|
| Supabase | Postgres + Storage | ✅ | Already done |
| Resend | Transactional email | ✅ | Already done. Verify a domain before launch to email real clients. |
| Upstash Redis | Rate limiting + webhook idempotency | ✅ | Already done |
| Anthropic | Claude API for report generation | Pay-as-you-go | `ANTHROPIC_API_KEY` |
| Google Cloud | GA4 OAuth (uses existing project) | ✅ | Enable **Analytics Data API** + **Google Analytics Admin API** + create OAuth 2.0 Client (Web) |
| Gumroad | Payments (10% + $0.50/sale) | ✅ | Create Membership product, get access token + product permalink |
| Inngest | Background jobs | ✅ | Only needed for production; dev mode works offline |
| Sentry | Error tracking | ✅ | Optional but recommended |
| Vercel | Hosting | ✅ | Connect GitHub repo |

## Environment variables

Copy `.env.example` → `.env` (local) or configure on Vercel. Key variables:

### Always required
- `DATABASE_URL`, `DIRECT_URL` — Supabase pooler + session URLs
- `AUTH_SECRET` — `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3001` dev / `https://yourdomain.com` prod
- `ENCRYPTION_KEY` — `openssl rand -hex 32`
- `PDF_RENDER_SECRET` — `openssl rand -hex 32`
- `NEXT_PUBLIC_APP_URL` — matches `NEXTAUTH_URL`
- `RESEND_API_KEY`, `FROM_EMAIL`, `FROM_NAME`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_STORAGE_BUCKET=reports`

### Needed to generate reports
- `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL=claude-sonnet-4-5`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### Needed for paid subscriptions
- `GUMROAD_ACCESS_TOKEN` — Gumroad → Settings → Advanced → Applications → create app
- `GUMROAD_PRODUCT_PERMALINK` — the `XXXXX` from `gumroad.com/l/XXXXX`
- `GUMROAD_WEBHOOK_SECRET` — optional shared secret, appended to Ping URL as `?secret=...`

## Google Cloud OAuth setup

1. In Google Cloud Console, enable these APIs:
   - **Google Analytics Data API**
   - **Google Analytics Admin API**
2. **OAuth consent screen**: set to External, add scopes `analytics.readonly` and `userinfo.email`.
3. **Credentials → Create OAuth 2.0 Client ID → Web application**.
   - Authorized JavaScript origins: `http://localhost:3001`, `https://yourdomain.com`
   - Authorized redirect URIs:
     - `http://localhost:3001/api/data-sources/callback/ga4`
     - `https://yourdomain.com/api/data-sources/callback/ga4`
4. Copy **Client ID** → `GOOGLE_CLIENT_ID` and **Client secret** → `GOOGLE_CLIENT_SECRET`.
5. During development the consent screen is in Testing mode — add your own Google account as a test user.

## Gumroad setup

1. Dashboard → **Products → New product → Membership**. Name "Reportly", price $49/mo, recurrence Monthly. Publish.
2. Copy the product URL — the short code at the end (`gumroad.com/l/XXXXX`) goes in `GUMROAD_PRODUCT_PERMALINK`.
3. **Settings → Advanced → Applications → Create application** → copy the access token → `GUMROAD_ACCESS_TOKEN`.
4. **Settings → Advanced → Ping endpoint**: set to `https://yourdomain.com/api/webhooks/gumroad?secret=YOUR_WEBHOOK_SECRET` (use any random string for the secret; put the same value in `GUMROAD_WEBHOOK_SECRET`). Save.
5. **Optional** — **Settings → Advanced → Resource subscriptions**: enable these resource events for richer pings:
   - `sale` (on sale + recurring charges)
   - `subscription_updated`, `subscription_ended`, `subscription_restarted`
   - `cancellation`, `refund`, `dispute`, `dispute_won`

### How the flow works

- User clicks "Subscribe" → we redirect to `https://gumroad.com/l/XXXXX?email={user.email}&userId={user.id}&wanted=true` (prefilled).
- User pays on Gumroad's hosted checkout.
- Gumroad `POST`s a ping to our webhook; we verify it by calling Gumroad's API for the `sale_id`.
- We set `plan=PAID`, store `gumroadSubscriptionId`, `gumroadSaleId`, and a `license_key` (if enabled on the product).
- "Manage subscription" in our UI opens `https://gumroad.com/subscriptions/{subId}/manage` where the buyer can update their card or cancel.
- On cancellation → `cancelAtPeriodEnd=true` (access continues until end of period). On `subscription_ended` → plan reverts to `FREE`.

### Local webhook testing

Gumroad needs a public URL. Use `ngrok http 3001`, then set Ping endpoint to `https://xxxx.ngrok.io/api/webhooks/gumroad?secret=...` temporarily. Easiest alternative: deploy to Vercel first, then do real end-to-end tests with a $1 test price.

## Inngest setup

- **Local dev**: run `npx inngest-cli@latest dev` alongside `npm run dev`. No signing key needed.
- **Production**: create an Inngest app, copy `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY`, and register the function URL `https://yourdomain.com/api/inngest` in the Inngest dashboard.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import the GitHub repo.
3. Add all env vars from `.env.example`.
4. Set **Build Command** to `npm run build` (it runs `prisma generate && next build`).
5. Deploy. First deploy will automatically create Vercel Postgres edge regions — no action needed.
6. After first successful deploy:
   - Update Google OAuth redirect URIs to include the Vercel URL.
   - Update Stripe webhook URL to the Vercel URL.
   - Add `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` after registering on Inngest.
7. Add your custom domain in Vercel → DNS.

## Pre-launch smoke test

Run each on the deployed URL:

1. Sign up → verify email → log in
2. Complete onboarding → workspace + first client created
3. Connect GA4 → select a property → DataSource created with `isActive=true`
4. Generate a report → status polls → READY within 60s
5. Open report → edit a section → download PDF → share link works in incognito
6. Send to client → email arrives with working PDF + share link
7. Click Subscribe → Gumroad checkout opens → pay (test with a $1 product first) → webhook ping → plan flips to PAID
8. Resend the same ping from Gumroad dashboard → no duplicate state change (idempotency via `GumroadEvent`)
9. Cancel via "Manage subscription" → `cancelAtPeriodEnd=true` → access continues until end of period → `subscription_ended` downgrades to FREE

## Going live

- [ ] Custom domain configured in Vercel + SSL active
- [ ] Gumroad product published + Ping endpoint pointing at production URL with `?secret=...`
- [ ] Resend domain verified (SPF, DKIM, DMARC)
- [ ] Google OAuth consent screen submitted for verification (if wide use intended)
- [ ] Password rotated for Supabase DB after testing
- [ ] Terms of Service + Privacy Policy pages live
- [ ] Sentry configured and alerting set up
- [ ] Support email set up

## Revenue safety

The app is designed so paid customers don't slip through cracks. Key guarantees:

1. **Every Gumroad ping is verified** (`api/webhooks/gumroad`) by re-fetching the sale from Gumroad's API with your access token — forged pings are rejected.
2. **Idempotency via `GumroadEvent` table** — the same ping can arrive multiple times, we process it once.
3. **Plan limits enforced server-side** (`plan-limits.ts`) — client limits, report monthly cap, integration cap.
4. **OAuth tokens encrypted at rest** (`crypto.ts`) — database breach doesn't expose Google access.
5. **Session-derived user IDs** — route handlers never trust a userId from the request body.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build (includes prisma generate)
- `npm run type-check` — TypeScript check only
- `npm run lint` — ESLint
- `npm run db:migrate` — create a new migration in dev
- `npm run db:deploy` — apply migrations in prod
- `npm run db:studio` — Prisma Studio GUI
