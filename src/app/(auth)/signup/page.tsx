"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Icon from "@mdi/react";
import { mdiCheckCircle } from "@mdi/js";

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
      {/* Heading */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Free for 14 days</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Start your free trial</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Generate your first AI report in under 60 seconds.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
            Your name <span className="font-normal normal-case tracking-normal opacity-60">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="stappli-input"
            placeholder="Jane Smith"
            autoComplete="name"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
            Work email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="stappli-input"
            placeholder="you@company.com"
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
              placeholder="Min. 8 characters"
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
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}
        {devVerifyUrl && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900 font-medium mb-2 flex items-center gap-1.5">
              <Icon path={mdiCheckCircle} size={0.65} />
              Account created. Verify your email to continue:
            </p>
            <a href={devVerifyUrl} className="text-xs text-[hsl(var(--primary))] font-medium hover:underline break-all">
              {devVerifyUrl}
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="stappli-button-primary w-full h-12 text-sm"
        >
          {loading ? "Creating your account…" : "Create free account →"}
        </button>

        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] pt-1">
          By signing up you agree to our{" "}
          <span className="text-[hsl(var(--foreground))] font-medium">Terms of Service</span>
          {" "}and{" "}
          <span className="text-[hsl(var(--foreground))] font-medium">Privacy Policy</span>.
        </p>
      </form>

      <div className="mt-8 pt-6 border-t border-[hsl(var(--border))] text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Already have an account?{" "}
          <Link href="/login" className="text-[hsl(var(--primary))] font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
