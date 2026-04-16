"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div>
        <h1 className="stappli-title mb-2">Invalid link</h1>
        <p className="stappli-subtitle mb-8">This reset link is missing or invalid.</p>
        <Link href="/forgot-password" className="text-[hsl(var(--primary))] font-medium hover:underline text-sm">
          Request a new link
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error?.message ?? "Something went wrong");
      return;
    }
    router.push("/login?reset=success");
  }

  return (
    <div>
      <h1 className="stappli-title mb-2">Choose a new password</h1>
      <p className="stappli-subtitle mb-8">Must be at least 8 characters.</p>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
            New password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="stappli-input"
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}
        <button type="submit" disabled={loading} className="stappli-button-primary w-full">
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
