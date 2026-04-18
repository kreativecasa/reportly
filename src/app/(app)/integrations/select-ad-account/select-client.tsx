"use client";

import { useState } from "react";

interface AdAccount {
  accountId: string;
  name: string;
  currency: string;
  status: number;
}

export function SelectAdAccountClient({ accounts }: { accounts: AdAccount[] }) {
  const [selected, setSelected] = useState<string>(accounts[0]?.accountId ?? "");

  function connect() {
    window.location.href = `/api/data-sources/connect/meta/finalize?accountId=${encodeURIComponent(selected)}`;
  }

  return (
    <div className="stappli-card p-6">
      <div className="space-y-2 mb-6">
        {accounts.map((a) => (
          <label
            key={a.accountId}
            className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition ${
              selected === a.accountId
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))]"
                : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
            }`}
          >
            <input
              type="radio"
              name="adAccount"
              value={a.accountId}
              checked={selected === a.accountId}
              onChange={(e) => setSelected(e.target.value)}
              className="accent-[hsl(var(--primary))]"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium break-all">{a.name}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                ID {a.accountId} · {a.currency} · {a.status === 1 ? "Active" : "Disabled"}
              </p>
            </div>
          </label>
        ))}
      </div>
      <button onClick={connect} disabled={!selected} className="stappli-button-primary w-full">
        Connect ad account
      </button>
    </div>
  );
}
