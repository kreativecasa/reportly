"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contactEmail: contactEmail || null, industry: industry || null, notes: notes || null }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error?.message ?? "Failed to create client");
      return;
    }
    router.push("/clients");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <Link href="/clients" className="text-sm text-[hsl(var(--muted-foreground))] hover:underline mb-4 inline-block">
        ← Back to clients
      </Link>
      <h1 className="stappli-title mb-2">New client</h1>
      <p className="stappli-subtitle mb-8">Add a new company you create reports for.</p>

      <form onSubmit={onSubmit} className="stappli-card p-8 space-y-5">
        <Field label="Client name" required>
          <input className="stappli-input" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Contact email">
          <input type="email" className="stappli-input" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </Field>
        <Field label="Industry">
          <input className="stappli-input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="E-commerce, SaaS, etc." />
        </Field>
        <Field label="Notes">
          <textarea rows={3} className="stappli-input h-auto py-3" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}
        <div className="flex gap-3">
          <Link href="/clients" className="stappli-button-ghost flex-1 text-center">
            Cancel
          </Link>
          <button disabled={loading} className="stappli-button-primary flex-1">
            {loading ? "Creating..." : "Create client"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
        {label} {required && <span className="text-[hsl(var(--destructive))]">*</span>}
      </label>
      {children}
    </div>
  );
}
