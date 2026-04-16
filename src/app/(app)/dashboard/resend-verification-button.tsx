"use client";

import { useState } from "react";
import Icon from "@mdi/react";
import { mdiCheckCircle } from "@mdi/js";

export function ResendVerificationButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function resend() {
    setState("sending");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      setState(json.success ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="text-xs font-medium text-amber-900 flex items-center gap-1.5">
        <Icon path={mdiCheckCircle} size={0.6} />
        Verification email sent — check your inbox.
      </p>
    );
  }

  return (
    <button
      onClick={resend}
      disabled={state === "sending"}
      className="shrink-0 text-xs font-bold uppercase tracking-wider text-amber-900 border border-amber-400 rounded-full px-4 py-1.5 hover:bg-amber-100 transition disabled:opacity-50"
    >
      {state === "sending" ? "Sending…" : state === "error" ? "Try again" : "Resend email"}
    </button>
  );
}
