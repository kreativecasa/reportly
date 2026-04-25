# Inngest — keeping the production app in sync

## What broke (April 2026)

After the `reportlyapp.me` → `reportlyapps.com` domain migration, every newly-generated report stayed stuck in `GENERATING` status with no activity, no errorMessage, no PDF.

Root cause: the Inngest Cloud app for `reportly` was registered against the old production URL (`https://www.reportlyapp.me/api/inngest`). After the domain swap, that URL stopped resolving (404), so when Inngest accepted an event and tried to invoke the `generate-report` function, the HTTP call failed and the function never ran. Events were accepted (200 from `inn.gs`) but no handler ever fired.

Sentry showed nothing because the failure happened on Inngest's side, not in the app.

## The fix

A single PUT to the app's Inngest endpoint forces Inngest Cloud to re-register the app at the **current** production URL:

```bash
curl -X PUT https://www.reportlyapps.com/api/inngest
```

Expected response:

```json
{ "message": "Successfully registered", "modified": true }
```

After that, queued and new events route correctly.

## How to prevent it from drifting again

Pick **one** of:

### Option A — Inngest's Vercel integration (recommended, one-time setup)

1. In the Inngest dashboard → **Apps → Sync new app → Vercel**.
2. Authorize Inngest on the `kreativecasaentertainment-3739s-projects` Vercel team.
3. Pick the `reportly` project. Inngest registers a deploy webhook so every successful production deploy auto-fires the PUT against the latest URL.

### Option B — Vercel deploy hook (if Option A isn't available)

1. Vercel project → **Settings → Git → Deploy Hooks** → create a hook called `inngest-sync` for branch `main`.
2. Inngest dashboard → **Apps → reportly → Settings → Webhooks** → paste the deploy-hook URL as `inngest sync target`.

### Option C — Manual (nuclear fallback)

Run the curl in `## The fix` section after every production deploy that:

- Adds, removes, or renames a function in `src/inngest/`
- Changes the function's `id` or `triggers`
- Changes the production domain or `/api/inngest` route shape

## Detecting it next time

Symptoms when sync has drifted:

- New reports stuck in `GENERATING` with `activities: []` and no `errorMessage`.
- `curl https://www.reportlyapps.com/api/inngest` returns 200 with `function_count: 4` (so the app is fine on its side).
- `curl -X POST https://inn.gs/e/$EVENT_KEY -d '{...}'` returns `{"status":200, "ids":[...]}` (so the event was accepted).

If all three are true and yet nothing runs, drift is the cause. Run the PUT.

## Related files

- `src/app/api/inngest/route.ts` — the `serve()` handler with the four registered functions.
- `src/inngest/client.ts` — `Inngest({ id: "reportly" })`.
- `src/inngest/generate-report.ts` — main report-generation job.
- `src/inngest/generate-pdf.ts` — Puppeteer-based PDF render.
