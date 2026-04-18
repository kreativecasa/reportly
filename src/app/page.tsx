import Link from "next/link";
import Icon from "@mdi/react";
import { Brand } from "@/components/brand";
import {
  mdiFlash,
  mdiRobot,
  mdiSend,
  mdiPencil,
  mdiPalette,
  mdiTrendingUp,
  mdiLink,
  mdiEmail,
  mdiLock,
  mdiFileDocument,
  mdiOfficeBuilding,
  mdiBriefcase,
  mdiRocket,
  mdiHandshake,
  mdiStar,
  mdiCheck,
  mdiCheckCircle,
  mdiCalendarCheck,
  mdiCreditCardOff,
} from "@mdi/js";

export default function Home() {
  return (
    <div className="bg-white text-[hsl(var(--foreground))]">
      {/* ── Sticky Nav ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[hsl(var(--border))]">
        <div className="stappli-page flex items-center justify-between py-4">
          <Brand size="lg" href="/" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[hsl(var(--muted-foreground))]">
            <a href="#how-it-works" className="hover:text-[hsl(var(--foreground))] transition">How it works</a>
            <a href="#features" className="hover:text-[hsl(var(--foreground))] transition">Features</a>
            <a href="#pricing" className="hover:text-[hsl(var(--foreground))] transition">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition px-3">
              Log in
            </Link>
            <Link href="/signup" className="stappli-button-primary">
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f0f5ff] via-white to-[#eaf7f4] pt-24 pb-28">
        <div className="pointer-events-none absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-[hsl(var(--primary))/0.08] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="stappli-page relative text-center">
          <span className="stappli-badge-active mb-6 inline-flex items-center gap-1.5">
            <Icon path={mdiCalendarCheck} size={0.6} />
            14-day free trial — no credit card required
          </span>

          <h1 className="mt-4 text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight max-w-4xl mx-auto">
            Client reports in{" "}
            <span className="text-[hsl(var(--primary))]">60 seconds.</span>
            <br />
            Not 60 minutes.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed">
            Intelligent reporting for client-facing teams. Connect your data, generate AI-written insights, deliver a polished report — fully branded, instantly.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="stappli-button-primary h-12 px-8 text-sm">
              Start free trial
            </Link>
            <Link href="/login" className="stappli-button-ghost h-12 px-8 text-sm">
              I have an account →
            </Link>
          </div>

          {/* Mock report card */}
          <div className="mt-20 mx-auto max-w-3xl rounded-3xl border border-[hsl(var(--border))] bg-white shadow-2xl overflow-hidden">
            <div className="border-b border-[hsl(var(--border))] px-6 py-4 flex items-center gap-3 bg-[hsl(var(--muted))]">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium ml-2">Q1 Performance Report — Acme Co</span>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {[
                { label: "Sessions", value: "142,830", change: "+18.4%", color: "text-emerald-600" },
                { label: "Conversions", value: "3,291", change: "+12.1%", color: "text-emerald-600" },
                { label: "Revenue", value: "$48,200", change: "+24.7%", color: "text-emerald-600" },
              ].map((m) => (
                <div key={m.label} className="rounded-2xl border border-[hsl(var(--border))] p-5 bg-[hsl(var(--muted))]">
                  <p className="stappli-table-header mb-2">{m.label}</p>
                  <p className="text-3xl font-bold">{m.value}</p>
                  <p className={`text-sm font-bold mt-1 ${m.color}`}>▲ {m.change} vs last period</p>
                </div>
              ))}
              <div className="md:col-span-3 rounded-2xl border border-[hsl(var(--border))] p-5 bg-[hsl(var(--primary))/0.04]">
                <p className="stappli-table-header mb-3">AI Insight</p>
                <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">
                  Organic traffic grew 18% driven by your blog content push in March. Paid search ROAS improved to 4.2x after bid strategy adjustment. <strong>Recommendation:</strong> Increase budget on top-performing branded keywords before Q2.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
        <div className="stappli-page py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "500+", label: "Teams using Reportly" },
            { value: "12,000+", label: "Reports generated" },
            { value: "60 sec", label: "Average generation time" },
            { value: "98%", label: "Client satisfaction rate" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-[hsl(var(--primary))]">{s.value}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="stappli-page py-28">
        <div className="text-center mb-16">
          <span className="stappli-table-header text-[hsl(var(--primary))]">How it works</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">Three steps to a perfect report</h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))] text-lg max-w-xl mx-auto">No design skills. No spreadsheets. Just plug in your data and let AI do the work.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-[hsl(var(--border))]" />
          {[
            { step: "01", title: "Connect your data", desc: "One-click OAuth with Google Analytics 4. Your data flows in automatically — no CSV exports, no copy-paste.", icon: mdiFlash },
            { step: "02", title: "Generate with AI", desc: "Claude reads your metrics and writes narrative insights, identifies wins, flags concerns, and recommends actions.", icon: mdiRobot },
            { step: "03", title: "Deliver to clients", desc: "Download a polished branded PDF or share a live link. Clients receive a boardroom-ready report without the wait.", icon: mdiSend },
          ].map((item) => (
            <div key={item.step} className="relative stappli-card p-8 hover-lift text-center">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--primary))/0.08] text-[hsl(var(--primary))] flex items-center justify-center mx-auto mb-6">
                <Icon path={item.icon} size={1.1} />
              </div>
              <span className="stappli-table-header text-[hsl(var(--primary))]">Step {item.step}</span>
              <h3 className="text-xl font-bold mt-2 mb-3">{item.title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features — Bento Grid ── */}
      <section id="features" className="py-28 bg-[hsl(var(--foreground))]">
        <div className="stappli-page">
          <div className="text-center mb-16">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Built for every client-facing team
            </h2>
            <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
              Whether you run a consultancy, an in-house team, or a solo practice — Reportly makes you look like a team of ten.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Card 1 — Large: AI narratives (2 cols) */}
            <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))] to-[#1a5cd8] p-8 flex flex-col justify-between min-h-[280px] relative overflow-hidden">
              <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-5">
                  <Icon path={mdiPencil} size={0.9} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">AI-written narratives</h3>
                <p className="text-white/70 text-sm leading-relaxed max-w-sm">
                  Stop staring at spreadsheets. Reportly reads your data and writes executive-quality insights — wins, risks, and next steps — in plain language clients actually read.
                </p>
              </div>
              <div className="mt-6 rounded-2xl bg-white/10 border border-white/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Sample AI insight</p>
                <p className="text-sm text-white/90 leading-relaxed">&ldquo;Organic sessions grew 23% YoY, outpacing paid by 3x. The blog content strategy is compounding — <strong className="text-white">recommend increasing editorial budget by 20%</strong> to capture Q3 momentum.&rdquo;</p>
              </div>
            </div>

            {/* Card 2 — Small: Branding */}
            <div className="rounded-3xl bg-white/5 border border-white/10 p-8 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-5">
                  <Icon path={mdiPalette} size={0.9} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Your brand, always</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Set your logo, colors, and workspace name once. Every report looks like it came from your team — not a third-party tool.
                </p>
              </div>
              <div className="mt-6 flex gap-2">
                {["#3475EF", "#10B981", "#F59E0B", "#EF4444"].map((c) => (
                  <span key={c} className="h-7 w-7 rounded-full border-2 border-white/20" style={{ backgroundColor: c }} />
                ))}
                <span className="h-7 w-7 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 text-xs">+</span>
              </div>
            </div>

            {/* Card 3 — Small: Charts */}
            <div className="rounded-3xl bg-white/5 border border-white/10 p-8 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-5">
                  <Icon path={mdiTrendingUp} size={0.9} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Auto-generated charts</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Line, bar, area, and pie charts built from your GA4 data. No Excel, no Canva — just data that speaks for itself.
                </p>
              </div>
            </div>

            {/* Card 4 — Large: Share + Deliver (2 cols) */}
            <div className="md:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-8 flex flex-col md:flex-row gap-8 min-h-[220px]">
              <div className="flex-1">
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-5">
                  <Icon path={mdiLink} size={0.9} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Instant share links</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Generate a live, branded URL your client can open in any browser. No login required. No downloads. No friction.
                </p>
              </div>
              <div className="flex-1">
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-5">
                  <Icon path={mdiEmail} size={0.9} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">One-click email delivery</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Send the report directly to your client from inside Reportly — complete with a branded message and PDF attachment.
                </p>
              </div>
            </div>

            {/* Card 5 — Large: Security (2 cols) */}
            <div className="md:col-span-2 rounded-3xl bg-emerald-950/60 border border-emerald-800/30 p-8 flex flex-col md:flex-row gap-8 min-h-[200px]">
              <div className="flex-1">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                  <Icon path={mdiLock} size={0.9} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Enterprise-grade security</h3>
                <p className="text-emerald-200/60 text-sm leading-relaxed">
                  All OAuth tokens are AES-256 encrypted at rest. Reports are private by default. Your clients&apos; data never leaves your control.
                </p>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-3">
                {["AES-256 token encryption", "Private reports by default", "Secure PDF storage", "OAuth 2.0 data access"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-emerald-200/70">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Icon path={mdiCheck} size={0.55} />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 6 — Small: PDF export */}
            <div className="rounded-3xl bg-white/5 border border-white/10 p-8 flex flex-col justify-between min-h-[200px]">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-5">
                  <Icon path={mdiFileDocument} size={0.9} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Polished PDF export</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Pixel-perfect branded PDFs generated in seconds — ready to attach to any email or client portal.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="stappli-page py-24">
        <div className="text-center mb-14">
          <span className="stappli-table-header text-[hsl(var(--primary))]">Who it&apos;s for</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">One tool, every client-facing role</h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))] text-lg max-w-xl mx-auto">
            From solo consultants to in-house growth teams — if you report to clients, Reportly is for you.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: mdiOfficeBuilding, role: "Marketing Teams", desc: "Deliver board-ready performance decks without hiring a data analyst." },
            { icon: mdiBriefcase, role: "Consultants", desc: "Impress retainer clients with premium reports that took minutes, not days." },
            { icon: mdiRocket, role: "Growth Professionals", desc: "Spend less time formatting and more time finding the next big opportunity." },
            { icon: mdiHandshake, role: "Account Managers", desc: "Keep every client informed, engaged, and seeing the value you deliver." },
          ].map((item) => (
            <div key={item.role} className="stappli-card p-6 hover-lift">
              <div className="text-[hsl(var(--primary))] mb-3">
                <Icon path={item.icon} size={1.1} />
              </div>
              <h3 className="font-bold text-sm mb-2">{item.role}</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-[hsl(var(--muted))] py-28">
        <div className="stappli-page">
          <div className="text-center mb-16">
            <span className="stappli-table-header text-[hsl(var(--primary))]">Pricing</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">Simple, honest pricing</h2>
            <p className="mt-4 text-[hsl(var(--muted-foreground))] text-lg max-w-xl mx-auto">One plan. Everything included. Start free for 14 days.</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="stappli-card p-8 border-2 border-[hsl(var(--primary))] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[hsl(var(--primary))] text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl">
                Most popular
              </div>
              <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-[hsl(var(--primary))/0.05]" />
              <p className="stappli-table-header mb-3">Reportly Pro</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-bold">$8</span>
                <span className="text-[hsl(var(--muted-foreground))] mb-2">/month</span>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">14-day free trial, cancel anytime.</p>

              <ul className="space-y-3 mb-8">
                {[
                  "Up to 3 clients",
                  "15 AI reports per month",
                  "Google Analytics 4 integration",
                  "Branded PDF export",
                  "Public share links",
                  "Email delivery to clients",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Icon path={mdiCheck} size={0.55} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="stappli-button-primary w-full justify-center">
                Start 14-day free trial
              </Link>
              <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-3">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="stappli-page py-28">
        <div className="text-center mb-16">
          <span className="stappli-table-header text-[hsl(var(--primary))]">Testimonials</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">Trusted by client-facing professionals</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "I used to spend 3 hours every month on client reports. Now it takes 5 minutes. My clients think I've hired a data analyst.",
              name: "Sarah K.",
              role: "Independent Growth Consultant",
            },
            {
              quote: "The AI-written insights are genuinely good. It catches things I would have missed and frames them in a way clients understand.",
              name: "Marcus T.",
              role: "Head of Digital, Boutique Strategy Firm",
            },
            {
              quote: "Our reports now look like they came from a 10-person team. Clients comment on the quality every single month.",
              name: "Priya R.",
              role: "Performance Marketing Lead",
            },
          ].map((t) => (
            <div key={t.name} className="stappli-card p-8 hover-lift flex flex-col">
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} path={mdiStar} size={0.65} className="text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed flex-1 mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[hsl(var(--primary))/0.1] flex items-center justify-center text-sm font-bold text-[hsl(var(--primary))]">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))] to-[#1a5cd8] py-28 text-white">
        <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="stappli-page relative text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Ready to reclaim your time?
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-10">
            Join hundreds of client-facing teams delivering beautiful AI reports in minutes — not hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white text-[hsl(var(--primary))] font-bold uppercase tracking-wider text-xs hover:opacity-90 active:scale-[0.98] transition"
            >
              Start free trial
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-white/40 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/10 active:scale-[0.98] transition"
            >
              I have an account
            </Link>
          </div>
          <p className="text-white/60 text-xs mt-4 uppercase tracking-wider">14-day free trial · No credit card required</p>
        </div>
      </section>

      {/* ── FAQ / SEO content ── */}
      <section className="stappli-page py-24">
        <div className="text-center mb-12">
          <span className="stappli-table-header text-[hsl(var(--primary))]">FAQ</span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight">Common questions</h2>
        </div>
        <div className="max-w-3xl mx-auto divide-y divide-[hsl(var(--border))]">
          {[
            {
              q: "How does Reportly generate reports?",
              a: "Reportly connects to your Google Analytics 4 account via OAuth. It pulls your traffic, conversion, and engagement data, then sends it to Claude AI which writes a narrative report with insights, wins, concerns, and recommendations — all in plain English your clients can understand.",
            },
            {
              q: "Is Reportly only for marketing consultants?",
              a: "Not at all. Any professional who presents performance data to clients or stakeholders benefits from Reportly — in-house marketing teams, growth leads, account managers, and independent consultants all use it to save hours every month.",
            },
            {
              q: "What integrations does Reportly support?",
              a: "Currently Google Analytics 4 (GA4). Google Ads, Meta Ads, and Search Console are on the roadmap. Your clients can see traffic, sessions, conversions, revenue, and engagement metrics all in one branded report.",
            },
            {
              q: "Can I brand the reports with my own logo?",
              a: "Yes — set your brand color and logo in workspace settings. Every report uses your branding, so clients see your name and identity, not Reportly.",
            },
            {
              q: "How do clients receive the report?",
              a: "Two ways: (1) download a polished PDF and attach it to your own email, or (2) click 'Send to client' inside Reportly and it sends directly with a branded link. You can also share a live read-only URL.",
            },
            {
              q: "Is there a free trial?",
              a: "Yes — 14 days free, no credit card required. Full access to report generation, PDF export, and client delivery from day one.",
            },
          ].map((faq) => (
            <div key={faq.q} className="py-6">
              <h3 className="font-bold text-base mb-2">{faq.q}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[hsl(var(--foreground))] text-white">
        <div className="stappli-page py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Brand size="lg" href={null} color="light" />
              <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-sm">
                Intelligent client reporting, powered by AI. Stop spending hours on reports — start impressing clients in seconds.
              </p>
              <div className="mt-6">
                <Link href="/signup" className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-[hsl(var(--primary))] text-white font-bold uppercase tracking-wider text-xs hover:opacity-90 transition">
                  Start free trial →
                </Link>
              </div>
              <p className="mt-3 text-xs text-white/40">14-day free trial · No credit card required</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Product</p>
              <ul className="space-y-3 text-sm text-white/70">
                <li><a href="#how-it-works" className="hover:text-white transition">How it works</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><Link href="/signup" className="hover:text-white transition">Start free trial</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Log in</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Who it&apos;s for</p>
              <ul className="space-y-3 text-sm text-white/70">
                <li><span>Marketing teams</span></li>
                <li><span>Consultants &amp; advisors</span></li>
                <li><span>Growth professionals</span></li>
                <li><span>Account managers</span></li>
                <li><span>Performance leads</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <span>© {new Date().getFullYear()} Reportly. All rights reserved.</span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
