"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDevVerifyUrl(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, email, password }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? "Signup failed");
        return;
      }
      if (json.data?.emailSent === false && json.data?.verifyUrl) {
        // Dev fallback: Resend can't deliver to this address
        setDevVerifyUrl(json.data.verifyUrl);
        return;
      }
      const login = await signIn("credentials", { email, password, redirect: false });
      if (login?.error) {
        setError("Account created, but sign-in failed. Try logging in.");
        return;
      }
      router.push("/onboarding");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="stappli-title mb-2">Create your account</h1>
      <p className="stappli-subtitle mb-8">Start your 14-day free trial. No credit card required.</p>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
            Name <span className="text-[hsl(var(--muted-foreground))] font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="stappli-input"
            autoComplete="name"
            autoFocus
          />
        </div>
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
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="stappli-input pr-20"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">At least 8 characters</p>
        </div>
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}
        {devVerifyUrl && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900 font-medium mb-2">
              ✓ Account created. Verification email couldn&apos;t be delivered (Resend free tier).
            </p>
            <p className="text-xs text-amber-900 mb-2">Click to verify this email manually:</p>
            <a
              href={devVerifyUrl}
              className="text-xs text-[hsl(var(--primary))] font-medium hover:underline break-all"
            >
              {devVerifyUrl}
            </a>
          </div>
        )}
        <button type="submit" disabled={loading} className="stappli-button-primary w-full">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-[hsl(var(--muted-foreground))] mt-8 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-[hsl(var(--primary))] font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
