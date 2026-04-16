"use client";

import { useState } from "react";

interface Property {
  propertyId: string;
  displayName: string;
  accountName?: string;
}

export function SelectPropertyClient({ properties }: { properties: Property[] }) {
  const [selected, setSelected] = useState<string>(properties[0]?.propertyId ?? "");

  function connect() {
    window.location.href = `/api/data-sources/connect/ga4/finalize?propertyId=${encodeURIComponent(selected)}`;
  }

  return (
    <div className="stappli-card p-6">
      <div className="space-y-2 mb-6">
        {properties.map((p) => (
          <label
            key={p.propertyId}
            className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition ${
              selected === p.propertyId
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))]"
                : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
            }`}
          >
            <input
              type="radio"
              name="property"
              value={p.propertyId}
              checked={selected === p.propertyId}
              onChange={(e) => setSelected(e.target.value)}
              className="accent-[hsl(var(--primary))]"
            />
            <div className="flex-1">
              <p className="font-medium">{p.displayName}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {p.accountName ? `${p.accountName} · ` : ""}ID {p.propertyId}
              </p>
            </div>
          </label>
        ))}
      </div>
      <button onClick={connect} disabled={!selected} className="stappli-button-primary w-full">
        Connect property
      </button>
    </div>
  );
}
