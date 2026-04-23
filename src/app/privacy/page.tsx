import Link from "next/link";
import type { Metadata } from "next";
import { Brand } from "@/components/brand";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Reportly collects, uses, stores, and protects your data when you generate AI-written marketing reports.",
  alternates: { canonical: "https://www.reportlyapps.com/privacy" },
};

const LAST_UPDATED = "April 23, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-[hsl(var(--foreground))]">
      <header className="border-b border-[hsl(var(--border))]">
        <div className="stappli-page py-5 flex items-center justify-between">
          <Brand size="md" href="/" />
          <nav className="flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
            <Link href="/terms" className="hover:text-[hsl(var(--foreground))] transition">
              Terms
            </Link>
            <Link href="/login" className="hover:text-[hsl(var(--foreground))] transition">
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main className="stappli-page py-16 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-12">Last updated {LAST_UPDATED}</p>

        <div className="prose-custom space-y-8 text-[15px] leading-relaxed">
          <section>
            <p>
              This Privacy Policy describes how Reportly (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses,
              stores, and shares information when you use the Reportly service at{" "}
              <span className="font-medium">reportlyapps.com</span> (the &quot;Service&quot;). By using the Service you agree
              to the handling of information as described here.
            </p>
          </section>

          <H2>1. Who we are</H2>
          <p>
            Reportly is a software-as-a-service product that helps agencies and freelancers generate AI-written marketing
            reports for their clients. The Service is operated by Kreative Casa Entertainment (the &quot;Operator&quot;),
            based in the United Arab Emirates. For privacy questions contact{" "}
            <a href="mailto:support@reportlyapps.com" className="text-[hsl(var(--primary))] underline">
              support@reportlyapps.com
            </a>
            .
          </p>

          <H2>2. Data we collect</H2>
          <p>We collect the minimum we need to deliver the Service. Specifically:</p>
          <List>
            <li>
              <b>Account data</b> — email address, name (optional), a password stored as a bcrypt hash (we never see the
              plaintext), and timestamps for signup / login / email verification.
            </li>
            <li>
              <b>Workspace + client data</b> — workspace name, brand color, optional logo URL, the names and contact
              details of the clients you add, and any notes you attach to them.
            </li>
            <li>
              <b>Integration tokens</b> — OAuth access and refresh tokens for any connected Google Analytics 4, Google
              Search Console, or Meta Ads accounts. Tokens are encrypted at rest using AES-256 before being written to
              the database.
            </li>
            <li>
              <b>Analytics data pulled on your behalf</b> — when you generate a report, Reportly fetches metrics from
              your connected data sources (e.g. sessions, clicks, impressions, ad spend) for the date range you select
              and stores a snapshot alongside the report.
            </li>
            <li>
              <b>Reports</b> — the AI-generated narrative, key metrics, insights, and any PDFs exported from a report.
            </li>
            <li>
              <b>Billing data</b> — payment is processed by Gumroad. We receive confirmation of a successful subscription
              (Gumroad sale id, subscription id, amount, currency, status). We never receive or store your credit-card
              details.
            </li>
            <li>
              <b>Operational data</b> — IP address from request headers (used only to rate-limit abuse-prone endpoints),
              server logs, and error reports sent to Sentry. We do not use third-party tracking or advertising cookies.
            </li>
          </List>

          <H2>3. How we use your data</H2>
          <List>
            <li>Provide the core Service — generate reports, deliver PDFs, send share links.</li>
            <li>Authenticate you (session cookies issued by NextAuth, strictly necessary).</li>
            <li>Enforce plan limits and prevent abuse via rate limiting.</li>
            <li>
              Send you transactional email about your account — email verification, password reset, trial reminders,
              payment notifications, report delivery.
            </li>
            <li>Diagnose and fix errors via Sentry.</li>
          </List>
          <p>
            We do <b>not</b> use your data or your clients&apos; data to train any machine-learning model. We do not sell
            or rent your data to anyone.
          </p>

          <H2>4. Third-party processors we share with</H2>
          <p>The following sub-processors receive limited data in order to provide specific functions:</p>
          <List>
            <li>
              <b>Anthropic, PBC</b> (Claude API) — we send your client&apos;s metrics + period context so Claude can
              generate the report narrative. Anthropic states it does not use API-submitted data to train its models.
            </li>
            <li>
              <b>Supabase Inc.</b> — Postgres database and file storage (encrypted PDFs).
            </li>
            <li>
              <b>Vercel Inc.</b> — application hosting and web analytics (aggregated, cookie-less).
            </li>
            <li>
              <b>Resend</b> — transactional email delivery.
            </li>
            <li>
              <b>Inngest Inc.</b> — background-job orchestration (report generation, PDF rendering, trial-ending emails).
            </li>
            <li>
              <b>Upstash Inc.</b> — Redis storage for rate-limit counters and short-lived OAuth state tokens.
            </li>
            <li>
              <b>Sentry (Functional Software, Inc.)</b> — error tracking.
            </li>
            <li>
              <b>Gumroad Inc.</b> — payment processing and subscription management. Gumroad sends us sale and
              cancellation events via webhook; we do not see card details.
            </li>
            <li>
              <b>Google LLC</b> and <b>Meta Platforms, Inc.</b> — only when you explicitly connect an integration. We
              exchange an OAuth token and use it strictly to fetch data you authorized.
            </li>
          </List>

          <H2>5. Google API Services — Limited Use disclosure</H2>
          <p>
            When you connect a Google integration (Google Analytics 4, Google Search Console, or Google Ads), Reportly
            requests OAuth access to specific Google API scopes. The specific scopes we request and what each is used
            for are:
          </p>
          <List>
            <li>
              <b>Google Analytics 4</b> — scope <code>.../auth/analytics.readonly</code>. Used only to list the GA4
              properties you own and pull the metrics for the date range you pick (sessions, users, pageviews, sources,
              events, conversions) so we can include them in the report you are generating. We do not modify any data
              in your Analytics account.
            </li>
            <li>
              <b>Google Search Console</b> — scope <code>.../auth/webmasters.readonly</code>. Used only to list the
              verified sites on your Google account and pull search-performance metrics (clicks, impressions, top
              queries, pages, countries, devices) for the date range you pick.
            </li>
            <li>
              <b>Google Ads</b> — scope <code>.../auth/adwords</code>. Used only to list the ad accounts accessible to
              your Google login and pull campaign performance metrics (spend, clicks, impressions, conversions) for the
              date range you pick.
            </li>
            <li>
              <b>Basic profile</b> — scopes <code>openid</code>, <code>email</code>, <code>profile</code> when you use
              &ldquo;Sign in with Google&rdquo;. Used only to identify your Reportly account.
            </li>
          </List>
          <p>
            <b>
              Reportly&apos;s use and transfer of information received from Google APIs to any other app will adhere
              to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-[hsl(var(--primary))] underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </b>
          </p>
          <p>
            This means, specifically:
          </p>
          <List>
            <li>
              We only use Google user data to provide and improve user-facing features of Reportly — namely, generating
              the marketing reports you ask us to generate.
            </li>
            <li>
              We do <b>not</b> transfer Google user data to third parties except as needed to provide the Service (e.g.
              we send metric values, never OAuth tokens, to Anthropic&apos;s Claude API to compose the report narrative,
              and we store encrypted tokens in Supabase and transient rate-limit data in Upstash as listed in Section
              4).
            </li>
            <li>
              We do <b>not</b> use Google user data for advertising, to build profiles, or to resell to data brokers.
            </li>
            <li>
              We do <b>not</b> allow humans to read your Google user data except: (a) with your explicit consent to
              resolve a specific support issue, (b) when required for security investigations or to comply with
              applicable law, or (c) when the data has been aggregated and is used for internal operations, in
              accordance with the Limited Use policy.
            </li>
            <li>
              We do <b>not</b> use your Google user data to train generalized machine-learning models.
            </li>
          </List>
          <p>
            You can revoke Reportly&apos;s access to your Google account at any time by visiting{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noreferrer"
              className="text-[hsl(var(--primary))] underline"
            >
              myaccount.google.com/permissions
            </a>{" "}
            and removing Reportly, or by clicking <b>Remove</b> next to the integration on the Integrations page inside
            Reportly (which both revokes the token with Google and deletes the stored token from our database).
          </p>

          <H2>6. Where data is stored</H2>
          <p>
            Application data is stored in Supabase&apos;s AWS ap-northeast-1 (Tokyo) region. Some sub-processors
            (Anthropic, Vercel, Sentry) may process data in the United States or the European Union.
          </p>

          <H2>7. Retention</H2>
          <List>
            <li>Account, workspace, and client data are retained while your account is active.</li>
            <li>
              Generated reports and PDFs are retained until you delete them or your account is closed.
            </li>
            <li>
              OAuth tokens are retained while the connection is active and are revoked on disconnect or account closure.
            </li>
            <li>
              Billing records are retained for 7 years to satisfy accounting requirements.
            </li>
            <li>
              Rate-limit counters expire within 1 hour of the last request.
            </li>
          </List>

          <H2>8. Your rights</H2>
          <p>
            You can at any time:
          </p>
          <List>
            <li>
              <b>Access or export</b> your data — email us and we will send you a copy within 30 days.
            </li>
            <li>
              <b>Correct</b> inaccurate data — most fields are editable in Settings.
            </li>
            <li>
              <b>Delete your account</b> — email us and we will delete your account, workspace, clients, reports, and
              revoke all stored OAuth tokens within 30 days, subject to legal retention requirements for billing.
            </li>
            <li>
              <b>Disconnect integrations</b> — from the Integrations page, which immediately revokes our stored tokens.
            </li>
          </List>
          <p>
            If you are in the EEA or UK, you have additional rights under GDPR, including the right to object to
            processing and the right to lodge a complaint with a supervisory authority.
          </p>

          <H2>9. Security</H2>
          <List>
            <li>Passwords are hashed with bcrypt (cost factor 12).</li>
            <li>OAuth access and refresh tokens are encrypted at rest with AES-256.</li>
            <li>All traffic is served over TLS with HSTS preload.</li>
            <li>Content Security Policy, X-Frame-Options, and other HTTP security headers are enforced.</li>
            <li>Per-endpoint rate limiting is enforced to mitigate abuse.</li>
            <li>We run automated error monitoring and follow security advisories for our dependencies.</li>
          </List>
          <p>
            No system is perfectly secure. If you discover a vulnerability please email{" "}
            <a href="mailto:support@reportlyapps.com" className="text-[hsl(var(--primary))] underline">
              support@reportlyapps.com
            </a>
            .
          </p>

          <H2>10. Children</H2>
          <p>
            Reportly is not directed to children under 16. If you believe a child has provided data to Reportly, contact
            us and we will delete it.
          </p>

          <H2>11. Changes to this policy</H2>
          <p>
            We may update this policy occasionally. When we do, we will change the &quot;Last updated&quot; date above
            and, for material changes, notify active users by email.
          </p>

          <H2>12. Contact</H2>
          <p>
            <a href="mailto:support@reportlyapps.com" className="text-[hsl(var(--primary))] underline">
              support@reportlyapps.com
            </a>
          </p>
        </div>
      </main>

      <footer className="border-t border-[hsl(var(--border))] py-8 mt-8">
        <div className="stappli-page flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center gap-2">
            <Brand size="sm" href="/" />
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[hsl(var(--foreground))] transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[hsl(var(--foreground))] transition">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold mt-10 mb-3">{children}</h2>;
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-6 space-y-2">{children}</ul>;
}
