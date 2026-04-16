"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [brandColor, setBrandColor] = useState("#3475ef");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceName,
        brandColor,
        clientName,
        clientContactEmail: clientEmail || null,
        clientIndustry: industry || null,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error?.message ?? "Setup failed");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F9F8] to-white">
      <header className="stappli-page py-6">
        <span className="text-xl font-bold">Reportly</span>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-20">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full ${
                n <= step ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--border))]"
              }`}
            />
          ))}
        </div>

        <div className="stappli-card p-8">
          {step === 1 && (
            <>
              <h1 className="stappli-title mb-2">Set up your workspace</h1>
              <p className="stappli-subtitle mb-8">How should your reports be branded?</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
                    Workspace name
                  </label>
                  <input
                    className="stappli-input"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="Acme Marketing"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
                    Brand color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="h-11 w-16 rounded-xl border border-[hsl(var(--border))] cursor-pointer"
                    />
                    <input className="stappli-input flex-1" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
                  </div>
                </div>
              </div>
              <button
                className="stappli-button-primary w-full mt-8"
                disabled={workspaceName.trim().length < 2}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="stappli-title mb-2">Add your first client</h1>
              <p className="stappli-subtitle mb-8">You&apos;ll generate reports for them.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
                    Client name
                  </label>
                  <input className="stappli-input" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Globex Corp" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
                    Contact email (optional)
                  </label>
                  <input type="email" className="stappli-input" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="jane@globex.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
                    Industry (optional)
                  </label>
                  <input className="stappli-input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="E-commerce" />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button className="stappli-button-ghost flex-1" onClick={() => setStep(1)}>Back</button>
                <button className="stappli-button-primary flex-1" disabled={clientName.trim().length < 1} onClick={() => setStep(3)}>
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="stappli-title mb-2">You&apos;re all set</h1>
              <p className="stappli-subtitle mb-8">
                Next step is connecting a data source like Google Analytics. You can do it from the dashboard.
              </p>
              <div className="bg-[hsl(var(--secondary))] rounded-2xl p-5 text-sm text-[hsl(var(--secondary-foreground))] mb-8">
                <p className="font-bold mb-1">Your 14-day free trial is active</p>
                <p>Generate up to 15 reports and connect up to 2 integrations.</p>
              </div>
              {error && <p className="text-sm text-[hsl(var(--destructive))] mb-4">{error}</p>}
              <div className="flex gap-3">
                <button className="stappli-button-ghost flex-1" onClick={() => setStep(2)}>Back</button>
                <button className="stappli-button-primary flex-1" disabled={loading} onClick={finish}>
                  {loading ? "Finishing..." : "Go to dashboard"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
