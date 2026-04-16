import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white text-[hsl(var(--foreground))]">
      {/* ── Sticky Nav ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[hsl(var(--border))]">
        <div className="stappli-page flex items-center justify-between py-4">
          <span className="text-xl font-bold tracking-tight">Reportly</span>
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
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-[hsl(var(--primary))/0.08] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="stappli-page relative text-center">
          <span className="stappli-badge-active mb-6 inline-flex">✦ 14-day free trial — no credit card required</span>

          <h1 className="mt-4 text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight max-w-4xl mx-auto">
            Client reports in{" "}
            <span className="text-[hsl(var(--primary))]">60 seconds.</span>
            <br />
            Not 60 minutes.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed">
            AI-powered marketing reports for agencies and freelancers. Connect your data, click generate, send to clients — fully branded.
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
            { value: "500+", label: "Agencies using Reportly" },
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
          {/* connector line */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-[hsl(var(--border))]" />

          {[
            {
              step: "01",
              title: "Connect your data",
              desc: "One-click OAuth with Google Analytics 4. Your data flows in automatically — no CSV exports, no copy-paste.",
              icon: "⚡",
            },
            {
              step: "02",
              title: "Generate with AI",
              desc: "Claude reads your metrics and writes narrative insights, identifies wins, flags concerns, and recommends actions.",
              icon: "🤖",
            },
            {
              step: "03",
              title: "Send to clients",
              desc: "Download a polished branded PDF or share a live link. Clients get a professional report without the wait.",
              icon: "📤",
            },
          ].map((item) => (
            <div key={item.step} className="relative stappli-card p-8 hover-lift text-center">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--primary))/0.08] flex items-center justify-center text-2xl mx-auto mb-6">
                {item.icon}
              </div>
              <span className="stappli-table-header text-[hsl(var(--primary))]">Step {item.step}</span>
              <h3 className="text-xl font-bold mt-2 mb-3">{item.title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-gradient-to-b from-[hsl(var(--muted))] to-white py-28">
        <div className="stappli-page">
          <div className="text-center mb-16">
            <span className="stappli-table-header text-[hsl(var(--primary))]">Features</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">Everything agencies need</h2>
            <p className="mt-4 text-[hsl(var(--muted-foreground))] text-lg max-w-xl mx-auto">Built specifically for marketing agencies and freelancers who bill by results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📊", title: "AI-written narratives", desc: "Claude turns raw numbers into plain-English insights your clients actually read." },
              { icon: "🎨", title: "Fully branded", desc: "Your logo, your colors, your domain. Reports look like they came from your agency." },
              { icon: "📈", title: "Beautiful charts", desc: "Line, bar, area, and pie charts auto-generated from your GA4 data." },
              { icon: "🔗", title: "Public share links", desc: "Send a branded live link — no PDF attachment required." },
              { icon: "📧", title: "Email delivery", desc: "Send the report directly to your client from inside Reportly." },
              { icon: "🔒", title: "Secure by default", desc: "All OAuth tokens encrypted at rest. Reports are private by default." },
            ].map((f) => (
              <div key={f.title} className="stappli-card p-6 hover-lift">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center text-xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="stappli-page py-28">
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
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
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
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-[hsl(var(--muted))] py-28">
        <div className="stappli-page">
          <div className="text-center mb-16">
            <span className="stappli-table-header text-[hsl(var(--primary))]">Testimonials</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">Agencies love Reportly</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "I used to spend 3 hours every month on client reports. Now it takes 5 minutes. My clients think I've hired a data analyst.",
                name: "Sarah K.",
                role: "Freelance SEO Consultant",
              },
              {
                quote: "The AI-written insights are genuinely good. It catches things I would have missed and frames them in a way clients understand.",
                name: "Marcus T.",
                role: "Founder, Digital Growth Agency",
              },
              {
                quote: "Branded reports with our logo and colors. Clients assume we have a whole reporting team. Worth every penny.",
                name: "Priya R.",
                role: "PPC Manager",
              },
            ].map((t) => (
              <div key={t.name} className="stappli-card p-6 hover-lift flex flex-col">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed flex-1 mb-6">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
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
            Join hundreds of agencies sending beautiful AI reports in minutes, not hours.
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

      {/* ── Footer ── */}
      <footer className="border-t border-[hsl(var(--border))] py-10">
        <div className="stappli-page flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[hsl(var(--muted-foreground))]">
          <span className="font-bold text-[hsl(var(--foreground))]">Reportly</span>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-[hsl(var(--foreground))] transition">Log in</Link>
            <Link href="/signup" className="hover:text-[hsl(var(--foreground))] transition">Sign up</Link>
          </div>
          <span>© {new Date().getFullYear()} Reportly. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
