# Domain migration — reportlyapp.me → reportlyapps.com

## Status

All code references have moved to `reportlyapps.com`. A permanent 301 redirect rule is wired into `next.config.ts` (see `redirects()`). The rule fires on any request that arrives at this app with `Host: reportlyapp.me` or `Host: www.reportlyapp.me` and rewrites it to the same path on `https://www.reportlyapps.com`.

## One-time Vercel action needed for the redirect to work

Next.js `redirects()` can only fire on requests that actually reach this app. So the old domain must still point to this Vercel project. Two options:

### Option A — keep the old domain on Vercel (recommended while GoDaddy keeps the registration)

1. Vercel Dashboard → `reportly` project → **Settings → Domains**.
2. Click **Add domain** → enter `reportlyapp.me`. Accept DNS instructions (they'll match what's already configured since the domain used to live here).
3. Repeat with `www.reportlyapp.me`.
4. Vercel will issue certificates within a minute. Requests that land on either hostname now hit this app and are 301'd by the rule in `next.config.ts`.

### Option B — if the GoDaddy registration is being released

Park a 301 redirect at the registrar (GoDaddy → **Domain Forwarding** → forward `reportlyapp.me` to `https://www.reportlyapps.com` with "Permanent (301)" selected). Then you can delete the host-based rule from `next.config.ts` because the redirect happens at the DNS / registrar level before a request is ever made.

## Verifying

Once Option A is done, run:

```bash
curl -sI https://www.reportlyapp.me/anything
# expect:
#   HTTP/2 308
#   location: https://www.reportlyapps.com/anything
```

Next.js emits a 308 for `permanent: true`. Google treats 308 and 301 equivalently for SEO redirect transfer.

## Why this matters

- Search Console: any backlinks to `reportlyapp.me` pass their PageRank / authority to the new domain through the 301.
- Bookmarks + old demo links from emails or slack keep working.
- Prevents a malicious actor from re-registering the domain and impersonating Reportly.
