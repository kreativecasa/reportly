"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div>
        <h1 className="stappli-title mb-2">Check your email</h1>
        <p className="stappli-subtitle">
          If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
        </p>
        <Link href="/login" className="inline-block mt-8 text-[hsl(var(--primary))] font-medium hover:underline text-sm">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="stappli-title mb-2">Reset your password</h1>
      <p className="stappli-subtitle mb-8">Enter your email and we&apos;ll send you a reset link.</p>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="stappli-input"
            autoComplete="email"
          />
        </div>
        <button type="submit" disabled={loading} className="stappli-button-primary w-full">
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <Link href="/login" className="inline-block mt-8 text-sm text-[hsl(var(--muted-foreground))] hover:underline">
        Back to login
      </Link>
    </div>
  );
}
