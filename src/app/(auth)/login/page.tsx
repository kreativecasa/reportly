"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  const signedInEmail = session?.user?.email ?? null;
  const initial = signedInEmail ? signedInEmail[0]?.toUpperCase() : "";

  return (
    <div>
      {signedInEmail ? (
        <>
          <h1 className="stappli-title mb-2">Welcome back</h1>
          <p className="stappli-subtitle mb-8">You&apos;re already signed in.</p>

          <div className="mb-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-[hsl(var(--primary))] text-white font-bold flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Signed in as
              </p>
              <p className="font-medium text-[hsl(var(--foreground))] truncate">{signedInEmail}</p>
            </div>
          </div>

          <Link href="/dashboard" className="stappli-button-primary w-full">
            Continue to dashboard
          </Link>

          <div className="my-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-[hsl(var(--border))]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
              Or sign in as someone else
            </span>
            <div className="flex-1 h-px bg-[hsl(var(--border))]" />
          </div>

          <button
            type="button"
            onClick={() => signOut({ redirect: false }).then(() => router.refresh())}
            className="stappli-button-ghost w-full"
          >
            Sign out &amp; use a different account
          </button>
        </>
      ) : (
        <>
          <h1 className="stappli-title mb-2">Welcome back</h1>
          <p className="stappli-subtitle mb-8">Log in to your Reportly account.</p>

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
                autoFocus
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-[hsl(var(--primary))] font-medium hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="stappli-input pr-20"
                  autoComplete="current-password"
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
            <button type="submit" disabled={loading} className="stappli-button-primary w-full">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-8 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[hsl(var(--primary))] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
