"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
}
interface DataSource {
  id: string;
  name: string;
  type: string;
  clientId: string | null;
}

export function NewReportForm({
  clients,
  dataSources,
  preselectClientId,
}: {
  clients: Client[];
  dataSources: DataSource[];
  preselectClientId?: string;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(preselectClientId ?? clients[0]?.id ?? "");
  const [preset, setPreset] = useState<"30" | "7" | "90" | "custom">("30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [title, setTitle] = useState("");
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableSources = useMemo(
    () => dataSources.filter((ds) => ds.clientId === null || ds.clientId === clientId),
    [dataSources, clientId],
  );

  function toggleSource(id: string) {
    setSelectedSources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function computeRange() {
    const now = new Date();
    if (preset === "custom") {
      if (!customStart || !customEnd) return null;
      return { start: new Date(customStart), end: new Date(customEnd) };
    }
    const days = Number(preset);
    const end = new Date(now);
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    return { start, end };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const range = computeRange();
    if (!range) {
      setError("Pick a valid date range");
      return;
    }
    const client = clients.find((c) => c.id === clientId);
    if (!client) {
      setError("Select a client");
      return;
    }
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const derivedTitle =
      title.trim() || `${client.name} — ${fmt(range.start)} to ${fmt(range.end)}`;

    setLoading(true);
    const res = await fetch("/api/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        title: derivedTitle,
        dateRangeStart: fmt(range.start),
        dateRangeEnd: fmt(range.end),
        dataSourceIds: Array.from(selectedSources),
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error?.message ?? "Failed to start generation");
      return;
    }
    router.push(`/reports/${json.data.reportId}`);
  }

  return (
    <form onSubmit={onSubmit} className="stappli-card p-8 space-y-6">
      <Field label="Client" required>
        <select className="stappli-input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {clients.length === 0 ? (
            <option value="">No clients yet — add one first</option>
          ) : (
            clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          )}
        </select>
      </Field>

      <Field label="Report title">
        <input
          className="stappli-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Auto-generated from client + dates if empty"
        />
      </Field>

      <Field label="Date range" required>
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: "7", l: "Last 7" },
            { v: "30", l: "Last 30" },
            { v: "90", l: "Last 90" },
            { v: "custom", l: "Custom" },
          ].map((o) => (
            <button
              type="button"
              key={o.v}
              onClick={() => setPreset(o.v as typeof preset)}
              className={`h-11 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                preset === o.v
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "bg-white border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <input type="date" className="stappli-input" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            <input type="date" className="stappli-input" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </div>
        )}
      </Field>

      <Field label="Data sources">
        {availableSources.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No active data sources. <a href="/integrations" className="text-[hsl(var(--primary))] hover:underline">Connect one →</a>
          </p>
        ) : (
          <div className="space-y-2">
            {availableSources.map((ds) => (
              <label
                key={ds.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-[hsl(var(--border))] cursor-pointer hover:bg-[hsl(var(--muted))]"
              >
                <input
                  type="checkbox"
                  checked={selectedSources.has(ds.id)}
                  onChange={() => toggleSource(ds.id)}
                  className="accent-[hsl(var(--primary))]"
                />
                <span className="flex-1 text-sm font-medium">{ds.name}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{ds.type.replace(/_/g, " ")}</span>
              </label>
            ))}
          </div>
        )}
      </Field>

      {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}
      <button type="submit" disabled={loading || clients.length === 0} className="stappli-button-primary w-full">
        {loading ? "Starting generation..." : "Generate report"}
      </button>
    </form>
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
