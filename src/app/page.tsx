import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F9F8] to-white">
      <header className="stappli-page flex items-center justify-between py-6">
        <span className="text-xl font-bold text-[hsl(var(--foreground))]">Reportly</span>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[hsl(var(--foreground))] hover:opacity-70 px-4">
            Log in
          </Link>
          <Link href="/signup" className="stappli-button-primary">
            Start free trial
          </Link>
        </nav>
      </header>

      <main className="stappli-page py-20 text-center">
        <span className="stappli-badge-active mb-6">14-day free trial</span>
        <h1 className="text-5xl md:text-6xl font-bold text-[hsl(var(--foreground))] mt-6 mb-6 leading-[1.1] tracking-tight">
          Client reports in 60 seconds.
          <br />
          <span className="text-[hsl(var(--primary))]">Not 60 minutes.</span>
        </h1>
        <p className="text-lg text-[hsl(var(--muted-foreground))] mb-10 max-w-xl mx-auto">
          AI-powered marketing reports for agencies and freelancers. Connect your data, click
          generate, send to clients.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup" className="stappli-button-primary">
            Start free trial
          </Link>
          <Link href="/login" className="stappli-button-ghost">
            I have an account
          </Link>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-4 uppercase tracking-wider">
          No credit card required
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          {[
            { t: "Connect your data", d: "Google Analytics, Google Ads, Meta — one OAuth click." },
            { t: "Generate with AI", d: "Claude writes narrative insights, wins, and actions." },
            { t: "Send to clients", d: "Polished PDF or branded share link in a single click." },
          ].map((f) => (
            <div key={f.t} className="stappli-card p-6 hover-lift">
              <h3 className="font-bold text-base mb-2">{f.t}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{f.d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
