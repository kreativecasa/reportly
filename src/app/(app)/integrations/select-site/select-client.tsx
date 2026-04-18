"use client";

import { useState } from "react";

interface Site {
  siteUrl: string;
  permissionLevel: string;
}

export function SelectSiteClient({ sites }: { sites: Site[] }) {
  const [selected, setSelected] = useState<string>(sites[0]?.siteUrl ?? "");

  function connect() {
    window.location.href = `/api/data-sources/connect/gsc/finalize?siteUrl=${encodeURIComponent(selected)}`;
  }

  return (
    <div className="stappli-card p-6">
      <div className="space-y-2 mb-6">
        {sites.map((s) => (
          <label
            key={s.siteUrl}
            className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition ${
              selected === s.siteUrl
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))]"
                : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
            }`}
          >
            <input
              type="radio"
              name="site"
              value={s.siteUrl}
              checked={selected === s.siteUrl}
              onChange={(e) => setSelected(e.target.value)}
              className="accent-[hsl(var(--primary))]"
            />
            <div className="flex-1">
              <p className="font-medium break-all">{s.siteUrl}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {s.permissionLevel.replace(/site/, "")} access
              </p>
            </div>
          </label>
        ))}
      </div>
      <button onClick={connect} disabled={!selected} className="stappli-button-primary w-full">
        Connect site
      </button>
    </div>
  );
}
