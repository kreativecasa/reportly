import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left: Marketing panel ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-[hsl(var(--foreground))] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-[hsl(var(--primary))/0.12] blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <Link href="/" className="relative text-xl font-bold text-white">
          Reportly
        </Link>

        {/* Main marketing copy */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1.5 mb-8">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/70 font-medium">Trusted by 500+ client-facing teams</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-[1.15] mb-6">
            Stop building reports.
            <br />
            <span className="text-[hsl(var(--primary))]">Start delivering results.</span>
          </h2>

          <p className="text-white/60 text-base leading-relaxed mb-10 max-w-sm">
            Connect your data once. Reportly writes the narrative, generates the charts, and sends a polished branded report — in under 60 seconds.
          </p>

          {/* Benefits */}
          <div className="space-y-4 mb-12">
            {[
              { icon: "⚡", text: "AI-written insights your clients actually read" },
              { icon: "🎨", text: "Fully branded with your logo and colors" },
              { icon: "📤", text: "PDF or share link delivered in one click" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-sm flex-shrink-0">
                  {b.icon}
                </div>
                <span className="text-sm text-white/80">{b.text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-amber-400 text-xs">★</span>
              ))}
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              "I used to spend 3 hours every month on client reports. Now it takes 5 minutes. My clients think I&apos;ve hired a data analyst."
            </p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[hsl(var(--primary))/0.3] flex items-center justify-center text-xs font-bold text-[hsl(var(--primary))]">
                S
              </div>
              <div>
                <p className="text-xs font-bold text-white">Sarah K.</p>
                <p className="text-[10px] text-white/40">Independent Growth Consultant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="relative text-xs text-white/30">© {new Date().getFullYear()} Reportly. All rights reserved.</p>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-[hsl(var(--border))]">
          <Link href="/" className="text-lg font-bold">Reportly</Link>
          <Link href="/" className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition">
            ← Back
          </Link>
        </div>

        {/* Back link — desktop */}
        <div className="hidden lg:flex justify-end px-10 pt-8">
          <Link href="/" className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition">
            ← Back to website
          </Link>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>

        {/* Trust bar */}
        <div className="px-6 pb-8 flex items-center justify-center gap-6 flex-wrap">
          {["🔒 Secure & encrypted", "✦ 14-day free trial", "✗ No credit card"].map((item) => (
            <span key={item} className="text-xs text-[hsl(var(--muted-foreground))]">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
