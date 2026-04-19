"use client";

import { useState } from "react";

interface Customer {
  customerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  isManager: boolean;
}

export function SelectAdCustomerClient({ customers }: { customers: Customer[] }) {
  const firstNonManager = customers.find((c) => !c.isManager);
  const [selected, setSelected] = useState<string>(firstNonManager?.customerId ?? customers[0]?.customerId ?? "");

  function connect() {
    // If the selected account has a manager among the list, pass it as loginCustomerId
    const manager = customers.find((c) => c.isManager);
    const params = new URLSearchParams({ customerId: selected });
    if (manager) params.set("loginCustomerId", manager.customerId);
    window.location.href = `/api/data-sources/connect/google-ads/finalize?${params.toString()}`;
  }

  return (
    <div className="stappli-card p-6">
      <div className="space-y-2 mb-6">
        {customers.map((c) => (
          <label
            key={c.customerId}
            className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition ${
              selected === c.customerId
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))]"
                : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
            } ${c.isManager ? "opacity-60" : ""}`}
          >
            <input
              type="radio"
              name="adCustomer"
              value={c.customerId}
              checked={selected === c.customerId}
              onChange={(e) => setSelected(e.target.value)}
              className="accent-[hsl(var(--primary))]"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{c.descriptiveName}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                ID {c.customerId} · {c.currencyCode} · {c.timeZone}
                {c.isManager && " · Manager account (no metrics)"}
              </p>
            </div>
          </label>
        ))}
      </div>
      <button onClick={connect} disabled={!selected} className="stappli-button-primary w-full">
        Connect account
      </button>
    </div>
  );
}
