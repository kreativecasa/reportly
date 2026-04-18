"use client";

import { useState } from "react";

export function BillingActions({ plan, hasSubscription }: { plan: string; hasSubscription: boolean }) {
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    setLoading(true);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const json = await res.json();
    setLoading(false);
    if (json.success && json.data?.url) window.location.href = json.data.url;
    else alert(json.error?.message ?? "Checkout unavailable");
  }

  async function manage() {
    setLoading(true);
    const res = await fetch("/api/billing/manage", { method: "POST" });
    const json = await res.json();
    setLoading(false);
    if (json.success && json.data?.url) window.open(json.data.url, "_blank");
    else alert(json.error?.message ?? "Manage unavailable");
  }

  if (plan === "PAID" || hasSubscription) {
    return (
      <button onClick={manage} disabled={loading} className="stappli-button-ghost">
        {loading ? "Loading..." : "Manage subscription"}
      </button>
    );
  }

  return (
    <button onClick={subscribe} disabled={loading} className="stappli-button-primary">
      {loading ? "Loading..." : "Subscribe — $8/mo"}
    </button>
  );
}
