import Link from "next/link";
import type { Metadata } from "next";
import { Brand } from "@/components/brand";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Reportly.",
  alternates: { canonical: "https://www.reportlyapp.me/terms" },
};

const LAST_UPDATED = "April 18, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-[hsl(var(--foreground))]">
      <header className="border-b border-[hsl(var(--border))]">
        <div className="stappli-page py-5 flex items-center justify-between">
          <Brand size="md" href="/" />
          <nav className="flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
            <Link href="/privacy" className="hover:text-[hsl(var(--foreground))] transition">
              Privacy
            </Link>
            <Link href="/login" className="hover:text-[hsl(var(--foreground))] transition">
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main className="stappli-page py-16 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-12">Last updated {LAST_UPDATED}</p>

        <div className="prose-custom space-y-8 text-[15px] leading-relaxed">
          <section>
            <p>
              These Terms of Service (the &quot;Terms&quot;) govern your use of the Reportly service available at{" "}
              <span className="font-medium">reportlyapp.me</span> (the &quot;Service&quot;), operated by Kreative Casa
              Entertainment (the &quot;Operator&quot;, &quot;we&quot;, &quot;us&quot;). By creating an account or using
              the Service you agree to these Terms. If you do not agree, do not use the Service.
            </p>
          </section>

          <H2>1. The Service</H2>
          <p>
            Reportly is a software-as-a-service product that helps you generate AI-written marketing reports for your
            clients by connecting to analytics data sources you authorize (Google Analytics 4, Google Search Console,
            Meta Ads, and others added over time).
          </p>

          <H2>2. Eligibility</H2>
          <p>
            You must be at least 18 years old and able to enter into a binding contract. If you use the Service on
            behalf of an organization, you represent that you have the authority to bind that organization to these
            Terms.
          </p>

          <H2>3. Your account</H2>
          <List>
            <li>You are responsible for keeping your password confidential and for all activity under your account.</li>
            <li>Notify us immediately at support@reportlyapp.me if you suspect unauthorized access.</li>
            <li>One person should use one account; do not share logins.</li>
          </List>

          <H2>4. Acceptable use</H2>
          <p>You agree not to:</p>
          <List>
            <li>Use the Service for anything unlawful, infringing, defamatory, or harmful.</li>
            <li>Reverse-engineer, decompile, or attempt to extract the source code of the Service.</li>
            <li>Abuse rate limits, scrape the Service, or use automated tools beyond reasonable client use.</li>
            <li>Connect data sources you are not authorized to access.</li>
            <li>Resell the Service or impersonate another person.</li>
          </List>
          <p>
            Violations may result in suspension or termination of your account without refund.
          </p>

          <H2>5. Plans, billing, and refunds</H2>
          <List>
            <li>
              A 14-day free trial starts when you complete onboarding. No credit card is required during the trial.
            </li>
            <li>
              After the trial, continued access requires an active paid subscription at the published price (currently
              <b> $8 USD per month</b>). Prices and plan limits may change with 30 days&apos; notice by email; changes
              do not apply to the current billing period.
            </li>
            <li>
              Payments are processed by <b>Gumroad</b>. Subscriptions auto-renew each month. You can cancel any time
              from your billing portal; cancellation takes effect at the end of the current paid period and you keep
              access until then.
            </li>
            <li>
              <b>Refunds:</b> if you are dissatisfied within the first 30 days of paying, email us and we will issue a
              full refund of the most recent monthly charge. After 30 days, refunds are at our discretion.
            </li>
            <li>
              We may suspend access for non-payment after reasonable notice.
            </li>
          </List>

          <H2>6. Third-party integrations</H2>
          <p>
            When you connect Google Analytics, Google Search Console, Meta Ads, or similar third-party accounts, you
            authorize Reportly to access the data within the scope you grant. You are responsible for complying with
            the terms of those third-party services, including the permissions you have to access the underlying data
            (for example, being an authorized user of a client&apos;s ad account).
          </p>

          <H2>7. Your content</H2>
          <List>
            <li>
              You retain all rights to the data you connect, the client information you enter, and the reports you
              generate (&quot;Your Content&quot;).
            </li>
            <li>
              You grant us a limited, worldwide, non-exclusive, royalty-free license to host, process, and display Your
              Content solely for the purpose of operating the Service for you.
            </li>
            <li>
              We do not use Your Content to train any machine-learning model. See the{" "}
              <Link href="/privacy" className="text-[hsl(var(--primary))] underline">Privacy Policy</Link> for details.
            </li>
          </List>

          <H2>8. AI-generated output</H2>
          <p>
            The narrative, insights, and recommendations in a report are generated by an AI model. While we work to
            produce useful output, AI can make mistakes, omit context, or produce incorrect figures. You are responsible
            for reviewing each report before sending it to a client. Reportly makes no warranty that any AI-generated
            content is accurate, complete, or fit for a particular business outcome.
          </p>

          <H2>9. Our intellectual property</H2>
          <p>
            The Reportly software, brand, logos, documentation, and templates are owned by the Operator. These Terms
            grant you a limited, non-transferable, non-exclusive license to use the Service as described. Nothing in
            these Terms transfers any IP rights to you beyond that license.
          </p>

          <H2>10. Service availability</H2>
          <p>
            We aim for continuous availability but do not guarantee uptime. Scheduled maintenance and unplanned outages
            can occur. We will not be liable for temporary unavailability.
          </p>

          <H2>11. Disclaimer of warranties</H2>
          <p className="uppercase text-xs tracking-wider text-[hsl(var(--muted-foreground))]">
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express
            or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not
            warrant that the Service will be uninterrupted, error-free, or secure, or that AI-generated output will be
            accurate.
          </p>

          <H2>12. Limitation of liability</H2>
          <p>
            To the maximum extent permitted by law, the Operator&apos;s total aggregate liability to you for any and all
            claims arising from or related to the Service is limited to the greater of (a) the fees you paid to us in
            the twelve months preceding the event giving rise to the claim, or (b) USD 100. We will not be liable for
            indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenue, goodwill,
            or data.
          </p>

          <H2>13. Indemnification</H2>
          <p>
            You agree to indemnify and hold the Operator harmless from any claim, loss, or expense (including reasonable
            legal fees) arising out of your violation of these Terms, your misuse of the Service, or your violation of
            a third party&apos;s rights — including the terms of any integration you connect.
          </p>

          <H2>14. Termination</H2>
          <List>
            <li>You may terminate your account at any time by emailing us.</li>
            <li>
              We may terminate or suspend your account at any time for breach of these Terms, non-payment, or if we
              reasonably believe the Service is being misused.
            </li>
            <li>
              On termination, access ends and stored data is deleted in line with the retention section of the{" "}
              <Link href="/privacy" className="text-[hsl(var(--primary))] underline">Privacy Policy</Link>.
            </li>
          </List>

          <H2>15. Changes to these Terms</H2>
          <p>
            We may update these Terms from time to time. Material changes will be notified by email at least 14 days
            before they take effect. Continued use after the effective date constitutes acceptance.
          </p>

          <H2>16. Governing law and venue</H2>
          <p>
            These Terms are governed by the laws of the United Arab Emirates. Disputes arising out of or related to
            these Terms will be resolved in the courts of the Emirate of Dubai, UAE.
          </p>

          <H2>17. Contact</H2>
          <p>
            <a href="mailto:support@reportlyapp.me" className="text-[hsl(var(--primary))] underline">
              support@reportlyapp.me
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
