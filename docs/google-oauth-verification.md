# Google OAuth Verification — Submission Pack

This is the copy-paste pack for the Google OAuth verification form at
**https://console.cloud.google.com/auth/verification?project=reportly-493419**.

Read this alongside `/privacy` (Section 5 has the Limited Use disclosure) and `/terms`.

---

## 1. App information

| Field | Value |
| --- | --- |
| App name | `Reportly` |
| App logo | 120×120 PNG, square, indigo background with white "R" monogram. File: `reportly-logo-120.png`. |
| Support email | `support@reportlyapps.com` |
| Developer contact | `haroonbasil5656@gmail.com` |
| Application home page | `https://www.reportlyapps.com` |
| Privacy policy URL | `https://www.reportlyapps.com/privacy` |
| Terms of service URL | `https://www.reportlyapps.com/terms` |
| Authorized domain | `reportlyapps.com` |
| User type | External |
| Publishing status | In production |

---

## 2. Scopes requested — justifications

For each sensitive / restricted scope below, paste the matching justification verbatim into the "Scope justification" textarea on the OAuth verification form.

### 2.1 `https://www.googleapis.com/auth/analytics.readonly` (sensitive)

**Why we need it:**

> Reportly is a marketing-report generator for agencies and freelancers. The core product feature is to let a user connect their Google Analytics 4 account once, then generate branded PDF reports summarising their site's performance over a chosen date range. The `analytics.readonly` scope is the minimum scope that lets us: (a) list the GA4 properties the user owns so they can choose which one to attach to which client, and (b) run a Data API report to pull sessions, users, pageviews, top sources, top pages, and conversions for the date range the user selected. The raw metric values are included in the report narrative Claude composes and in the rendered PDF. No modification of the user's GA4 data is ever performed (read-only). No data is shared with any third party beyond the sub-processors listed in our privacy policy, all of whom are strictly necessary to render the user-requested report (Anthropic Claude composes the narrative; Supabase stores the report row; Vercel serves the site; Resend delivers the email to the user's client).

**What the user sees:** a consent screen where they tick "See and download your Google Analytics data" and are returned to Reportly's Integrations page.

### 2.2 `https://www.googleapis.com/auth/webmasters.readonly` (sensitive)

**Why we need it:**

> Many of our users report on SEO performance alongside GA4. The `webmasters.readonly` scope is the minimum scope that lets us list the verified sites a user owns in Google Search Console and pull search-performance metrics (clicks, impressions, CTR, average position, top queries, top pages, top countries, top devices) for the user-selected date range, so we can include an SEO section in the generated report. Data is read-only; we never create, modify, or submit anything to Search Console. Data flows and storage are identical to the Google Analytics section above.

### 2.3 `https://www.googleapis.com/auth/adwords` (restricted)

**Why we need it:**

> Agencies running paid-media accounts for clients want a single report that pulls together GA4 + Search Console + Google Ads performance. The `adwords` scope, combined with our approved Google Ads API developer token, is the minimum that lets us list the customer accounts a user has access to, pick one per client, and run a GAQL query to pull spend, clicks, impressions, conversions, and campaign-level performance for the user-selected date range. All calls are reporting queries (`SELECT`); we never create, modify, pause, or delete campaigns, ad groups, ads, or budgets. Data flows and storage are identical to the Google Analytics section above.

### 2.4 `openid`, `email`, `profile` (non-sensitive)

**Why we need them:**

> Standard Sign-in-with-Google scopes. Used only to identify the Reportly account when a user signs in. We do not access any Google service on the user's behalf with these scopes.

---

## 3. Data handling — short answers (for the form)

| Question | Answer |
| --- | --- |
| Does your app access, transmit or store restricted-scope Google data? | Yes — Google Ads `adwords`. Read-only performance metrics for the user-selected date range, stored in a Postgres database row (Supabase, AWS ap-northeast-1, encrypted at rest via Supabase's managed encryption). OAuth refresh tokens are encrypted with AES-256 application-level before write. |
| Do you share Google user data with any third parties? | Only sub-processors strictly necessary to deliver the service (Anthropic Claude for narrative composition, Supabase for database/storage, Vercel for hosting, Resend for email, Upstash for rate-limit counters, Sentry for error monitoring, Inngest for background jobs, Gumroad for billing). No advertising, no data brokers, no profile-building. See Section 4 and 5 of our privacy policy. |
| Do you use Google user data to train machine-learning models? | No. |
| Do you transfer Google user data for AI/ML model training? | No. We send metric values (not tokens) to the Anthropic Claude API to compose the report narrative; Anthropic's API terms state submitted data is not used to train models. |
| Do humans read Google user data? | Only with the user's explicit consent to resolve a specific support issue, when required for security investigations or to comply with applicable law, or when the data has been aggregated and used for internal operations — consistent with the Limited Use policy. |

---

## 4. Demo video — shot list

Upload an unlisted YouTube video that contains **all** of the shots below. Typical length 3–4 min.

1. Address bar: navigate to `https://www.reportlyapps.com`.
2. Click **Sign in** → log in with an existing Reportly account.
3. Land on the Dashboard.
4. Click **Integrations** in the sidebar.
5. On the **Google Analytics 4** card, narrate the Important callout ("On the Google consent screen, tick…"). Click **Connect**.
6. Google redirects to Reportly's consent screen. Show the requested scope line. Narrate: *"Reportly is requesting read-only access to my Google Analytics data. I tick the checkbox and click Continue."* Tick the checkbox, click Continue.
7. Back on Reportly — property picker appears. Select a property.
8. Return to Integrations page — the GA4 connection is now listed as Active.
9. Navigate to **Reports → New report**. Pick the client, pick a date range, click **Generate**.
10. Report generates (~30s). Show the narrative referencing real GA4 numbers (sessions, users).
11. Open **privacy policy** at `https://www.reportlyapps.com/privacy` and scroll to Section 5 (Google API Services — Limited Use disclosure). Narrate the Limited Use paragraph on-camera.
12. Optionally: revoke access on `myaccount.google.com/permissions` to show the user-controlled disconnect path.

Make sure every URL bar visible in the recording shows `reportlyapps.com` (not the old `reportlyapp.me`).

---

## 5. Final pre-submission checklist

- [ ] Privacy policy at `/privacy` contains the verbatim Limited Use block (Section 5). ✅ (Done — see `src/app/privacy/page.tsx`.)
- [ ] Terms of service link in footer works on production (`/terms`). ✅
- [ ] Authorized domain in OAuth consent screen = `reportlyapps.com`. ✅
- [ ] Authorized redirect URI in OAuth client = `https://www.reportlyapps.com/api/data-sources/callback/ga4`. ✅
- [ ] App logo uploaded on Branding page. ⏳ (Pending user action — file ready at `reportly-logo-120.png`.)
- [ ] Demo video uploaded to YouTube as **Unlisted**. ⏳
- [ ] Video URL pasted into the verification form. ⏳
- [ ] Scope justifications (Section 2) pasted into the form — one per scope. ⏳

Review SLA from Google: typically 2–6 weeks. They email the developer-contact address.
